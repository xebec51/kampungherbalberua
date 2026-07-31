"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canDeleteContent,
  canEditContent,
  canPublishContent,
} from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  createPlant,
  deletePlant,
  getPlantByIdForAdmin,
  setPlantWorkflowForAdmin,
  updatePlant,
  type PlantAdminInput,
} from "@/lib/data/admin/plants";
import { uploadContentCoverPhoto } from "@/lib/data/admin/media-upload";
import {
  canPublishWithValidation,
  contentStatuses,
  hasVerifiedRequirements,
  isAllowed,
  isValidSlug,
  normalizeImagePath,
  normalizeOptionalText,
  parseTextareaLines,
  plantCategories,
  validationStatuses,
} from "@/lib/validation/content";
import { parseWorkflowActionFormData } from "@/lib/workflow/parse-workflow-action";

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
  return normalizeOptionalText(readText(formData, name));
}

function readLines(formData: FormData, name: string) {
  return parseTextareaLines(readText(formData, name));
}

function parsePlantFormData(formData: FormData): ParsedPlantInput {
  const slug = readText(formData, "slug").toLowerCase();
  const localName = readText(formData, "local_name");
  const shortDescription = readText(formData, "short_description");
  const description = readText(formData, "description");
  const category = readText(formData, "category");
  const contentStatus = readText(formData, "content_status");
  const validationStatus = readText(formData, "validation_status");
  const imagePathResult = normalizeImagePath(readText(formData, "image_path"));
  const validatorName = readOptionalText(formData, "validator_name");
  const validationCheckedAt = readOptionalText(formData, "validation_checked_at");
  const validationNotes = readOptionalText(formData, "validation_notes");
  const sourceNotes = readOptionalText(formData, "source_notes");

  if (!isValidSlug(slug)) {
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
    !hasVerifiedRequirements(
      validationStatus,
      validatorName,
      sourceNotes,
      validationCheckedAt,
    )
  ) {
    return {
      data: null,
      error: "Status terverifikasi wajib memiliki pemeriksa, sumber, dan tanggal pemeriksaan.",
    };
  }

  if (
    !canPublishWithValidation({
      checkedAt: validationCheckedAt,
      checkerName: validatorName,
      contentStatus,
      sourceNotes,
      validationStatus,
    })
  ) {
    return {
      data: null,
      error: "Konten hanya dapat dipublikasikan setelah validasi terverifikasi lengkap.",
    };
  }

  if (imagePathResult.error) {
    return { data: null, error: imagePathResult.error };
  }

  return {
    data: {
      care_instructions: readLines(formData, "care_instructions"),
      category,
      content_status: contentStatus,
      description,
      featured: formData.get("featured") === "on",
      image_path: imagePathResult.value,
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
      validation_checked_at: validationCheckedAt,
      validation_notes: validationNotes,
      validator_name: validatorName,
      warnings: readLines(formData, "warnings"),
    },
    error: null,
  };
}

function errorCode(message: string) {
  if (message.includes("Slug") || message.includes("kode")) {
    return "duplikat";
  }

  if (message.includes("admin")) {
    return "otorisasi";
  }

  if (message.includes("belum lengkap")) {
    return "tidak-lengkap";
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

  const parsed = parsePlantFormData(formData);

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

  const parsed = parsePlantFormData(formData);

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

export async function setPlantWorkflowAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/tanaman");
  const id = readText(formData, "id");
  const actorName = profile.display_name?.trim() || user.email || null;

  if (!id || !canPublishContent(profile.role)) {
    redirect("/admin/tanaman?error=otorisasi");
  }

  const existing = await getPlantByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/tanaman?error=tidak-ditemukan");
  }

  const parsed = parseWorkflowActionFormData(formData);

  if (!parsed.ok) {
    redirect(`/admin/tanaman?error=${parsed.error}`);
  }

  const result = await setPlantWorkflowForAdmin({
    action: parsed.action,
    actorId: user.id,
    actorName,
    id,
  });

  if (result.error || !result.data) {
    redirect(`/admin/tanaman?error=${errorCode(result.error ?? "gagal")}`);
  }

  revalidatePlantPages(existing.data.slug, result.data.slug);

  const successCode =
    parsed.action.type === "publish"
      ? "dipublikasikan"
      : parsed.action.type === "reject"
        ? "perlu-perbaikan"
        : "diarsipkan";

  redirect(`/admin/tanaman?success=${successCode}`);
}

function photoErrorCode(message: string) {
  if (message.includes("Format file")) {
    return "foto-format";
  }

  if (message.includes("Ukuran") || message.includes("kompresi")) {
    return "foto-ukuran";
  }

  return "foto-gagal";
}

export async function uploadPlantPhotoAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/tanaman");
  const id = readText(formData, "id");
  const actorName = profile.display_name?.trim() || user.email || null;

  if (!id || !canEditContent(profile.role)) {
    redirect("/admin/tanaman?error=otorisasi");
  }

  const existing = await getPlantByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/tanaman?error=tidak-ditemukan");
  }

  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/tanaman/${id}/edit?error=foto-kosong`);
  }

  const result = await uploadContentCoverPhoto({
    actorId: user.id,
    actorName,
    entityId: id,
    entityLabel: existing.data.local_name,
    entitySlug: existing.data.slug,
    file,
    target: "plant",
  });

  if (result.error) {
    console.error("Gagal mengunggah foto tanaman", { plantId: id });
    redirect(`/admin/tanaman/${id}/edit?error=${photoErrorCode(result.error)}`);
  }

  revalidatePlantPages(existing.data.slug, existing.data.slug);
  redirect(`/admin/tanaman/${id}/edit?success=foto-diperbarui`);
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
