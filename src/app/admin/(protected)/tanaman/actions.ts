"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canDeleteContent,
  canEditContent,
  canPublishContent,
} from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import type {
  ContentStatus,
  PlantCategory,
  ValidationStatus,
} from "@/lib/supabase/database.types";
import {
  createPlant,
  deletePlant,
  getPlantByIdForAdmin,
  updatePlant,
  type PlantAdminInput,
  type PlantAdminRecord,
} from "@/lib/data/admin/plants";

const contentStatuses = [
  "draft",
  "pending_review",
  "published",
  "archived",
] as const satisfies readonly ContentStatus[];

const validationStatuses = [
  "data_demonstrasi",
  "pending",
  "verified",
  "rejected",
] as const satisfies readonly ValidationStatus[];

const plantCategories = [
  "rimpang",
  "daun",
  "bunga",
  "batang",
  "lainnya",
] as const satisfies readonly PlantCategory[];

const editorContentStatuses = ["draft", "pending_review"] as const;
const editorValidationStatuses = ["data_demonstrasi", "pending"] as const;

type ParsedPlantInput =
  | {
      data: PlantAdminInput;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalText(formData: FormData, name: string) {
  const value = readText(formData, name);
  return value.length > 0 ? value : null;
}

function readLines(formData: FormData, name: string) {
  return readText(formData, name)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isAllowed<T extends string>(
  value: string,
  options: readonly T[],
): value is T {
  return options.includes(value as T);
}

function parsePlantFormData(formData: FormData, role: string): ParsedPlantInput {
  const slug = readText(formData, "slug").toLowerCase();
  const localName = readText(formData, "local_name");
  const shortDescription = readText(formData, "short_description");
  const description = readText(formData, "description");
  const category = readText(formData, "category");
  const contentStatus = readText(formData, "content_status");
  const validationStatus = readText(formData, "validation_status");
  const imagePath = readOptionalText(formData, "image_path");
  const validatorName = readOptionalText(formData, "validator_name");
  const sourceNotes = readOptionalText(formData, "source_notes");

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { data: null, error: "Slug wajib huruf kecil, angka, atau tanda hubung." };
  }

  if (!localName || !shortDescription || !description) {
    return { data: null, error: "Nama, ringkasan, dan deskripsi wajib diisi." };
  }

  if (localName.length > 120 || slug.length > 100 || shortDescription.length > 260) {
    return { data: null, error: "Beberapa isian melebihi batas panjang." };
  }

  if (!isAllowed(category, plantCategories)) {
    return { data: null, error: "Kategori tanaman tidak valid." };
  }

  if (!isAllowed(contentStatus, contentStatuses)) {
    return { data: null, error: "Status konten tidak valid." };
  }

  if (!isAllowed(validationStatus, validationStatuses)) {
    return { data: null, error: "Status validasi tidak valid." };
  }

  if (
    role === "editor" &&
    (!isAllowed(contentStatus, editorContentStatuses) ||
      !isAllowed(validationStatus, editorValidationStatuses))
  ) {
    return {
      data: null,
      error: "Editor hanya dapat menyimpan draft atau pending review.",
    };
  }

  if (validationStatus === "verified" && (!validatorName || !sourceNotes)) {
    return {
      data: null,
      error: "Status terverifikasi wajib memiliki validator dan sumber.",
    };
  }

  if (
    imagePath &&
    (!imagePath.startsWith("/images/") ||
      imagePath.toLowerCase().includes("javascript:") ||
      imagePath.includes("://"))
  ) {
    return { data: null, error: "Path gambar harus lokal dan diawali /images/." };
  }

  return {
    data: {
      care_instructions: readLines(formData, "care_instructions"),
      category,
      content_status: contentStatus,
      description,
      featured: formData.get("featured") === "on",
      image_path: imagePath,
      local_name: localName,
      location_status: readOptionalText(formData, "location_status"),
      other_names: readLines(formData, "other_names"),
      plant_code: readOptionalText(formData, "plant_code"),
      preparation: readLines(formData, "preparation"),
      scientific_name: readOptionalText(formData, "scientific_name"),
      short_description: shortDescription,
      slug,
      source_notes: sourceNotes,
      traditional_uses: readLines(formData, "traditional_uses"),
      used_parts: readLines(formData, "used_parts"),
      validation_status: validationStatus,
      validator_name: validatorName,
      warnings: readLines(formData, "warnings"),
    },
    error: null,
  };
}

function plantRecordToInput(plant: PlantAdminRecord): PlantAdminInput {
  return {
    care_instructions: plant.care_instructions,
    category: plant.category,
    content_status: plant.content_status,
    description: plant.description,
    featured: plant.featured,
    image_path: plant.image_path,
    local_name: plant.local_name,
    location_status: plant.location_status,
    other_names: plant.other_names,
    plant_code: plant.plant_code,
    preparation: plant.preparation,
    scientific_name: plant.scientific_name,
    short_description: plant.short_description,
    slug: plant.slug,
    source_notes: plant.source_notes,
    traditional_uses: plant.traditional_uses,
    used_parts: plant.used_parts,
    validation_status: plant.validation_status,
    validator_name: plant.validator_name,
    warnings: plant.warnings,
  };
}

function errorCode(message: string) {
  if (message.includes("Slug") || message.includes("kode")) {
    return "duplikat";
  }

  if (message.includes("Editor") || message.includes("admin")) {
    return "otorisasi";
  }

  return "validasi";
}

function revalidatePlantPages(oldSlug?: string, newSlug?: string) {
  revalidatePath("/");
  revalidatePath("/tanaman");
  revalidatePath("/admin");
  revalidatePath("/admin/tanaman");
  revalidatePath("/sitemap.xml");

  if (oldSlug) {
    revalidatePath(`/tanaman/${oldSlug}`);
  }

  if (newSlug && newSlug !== oldSlug) {
    revalidatePath(`/tanaman/${newSlug}`);
  }
}

export async function createPlantAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/tanaman/baru");

  if (!canEditContent(profile.role)) {
    redirect("/admin/tanaman?error=readonly");
  }

  const parsed = parsePlantFormData(formData, profile.role);

  if (parsed.error || !parsed.data) {
    redirect(`/admin/tanaman/baru?error=${errorCode(parsed.error ?? "validasi")}`);
  }

  const input = parsed.data;
  const result = await createPlant(input, user.id);

  if (result.error || !result.data) {
    redirect(`/admin/tanaman/baru?error=${errorCode(result.error ?? "gagal")}`);
  }

  const createdPlant = result.data;
  revalidatePlantPages(undefined, createdPlant.slug);
  redirect(`/admin/tanaman/${createdPlant.id}/edit?success=dibuat`);
}

export async function updatePlantAction(id: string, formData: FormData) {
  const { profile, user } = await requireStaff(`/admin/tanaman/${id}/edit`);

  if (!canEditContent(profile.role)) {
    redirect(`/admin/tanaman/${id}/edit?error=readonly`);
  }

  const existing = await getPlantByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/tanaman?error=tidak-ditemukan");
  }

  const currentPlant = existing.data;

  if (
    profile.role === "editor" &&
    !["draft", "pending_review"].includes(currentPlant.content_status)
  ) {
    redirect(`/admin/tanaman/${id}/edit?error=otorisasi`);
  }

  const parsed = parsePlantFormData(formData, profile.role);

  if (parsed.error || !parsed.data) {
    redirect(
      `/admin/tanaman/${id}/edit?error=${errorCode(parsed.error ?? "validasi")}`,
    );
  }

  const input = parsed.data;
  const result = await updatePlant(id, input, user.id);

  if (result.error || !result.data) {
    redirect(`/admin/tanaman/${id}/edit?error=${errorCode(result.error ?? "gagal")}`);
  }

  const updatedPlant = result.data;
  revalidatePlantPages(currentPlant.slug, updatedPlant.slug);
  redirect(`/admin/tanaman/${id}/edit?success=diperbarui`);
}

export async function archivePlantAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/tanaman");
  const id = readText(formData, "id");

  if (!id || !canPublishContent(profile.role)) {
    redirect("/admin/tanaman?error=otorisasi");
  }

  const existing = await getPlantByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/tanaman?error=tidak-ditemukan");
  }

  const input = {
    ...plantRecordToInput(existing.data),
    content_status: "archived" as const,
  };
  const result = await updatePlant(id, input, user.id);

  if (result.error || !result.data) {
    redirect(`/admin/tanaman?error=${errorCode(result.error ?? "gagal")}`);
  }

  revalidatePlantPages(existing.data.slug, result.data.slug);
  redirect("/admin/tanaman?success=diarsipkan");
}

export async function deletePlantAction(formData: FormData) {
  const { profile } = await requireStaff("/admin/tanaman");
  const id = readText(formData, "id");
  const confirmed = formData.get("confirm_delete") === "permanen";

  if (!id || !canDeleteContent(profile.role) || !confirmed) {
    redirect("/admin/tanaman?error=hapus");
  }

  const existing = await getPlantByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/tanaman?error=tidak-ditemukan");
  }

  const result = await deletePlant(id, profile.role);

  if (result.error) {
    redirect(`/admin/tanaman?error=${errorCode(result.error)}`);
  }

  revalidatePlantPages(existing.data.slug);
  redirect("/admin/tanaman?success=dihapus");
}
