"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canDeleteContent, canEditContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  createHealthCondition,
  deleteHealthCondition,
  getHealthConditionByIdForAdmin,
  updateHealthCondition,
  type HealthConditionAdminInput,
} from "@/lib/data/admin/health-conditions";
import {
  isValidSlug,
  parseTextareaLines,
} from "@/lib/validation/content";

type ParsedHealthConditionInput =
  | {
      data: HealthConditionAdminInput;
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

function readLines(formData: FormData, name: string) {
  return parseTextareaLines(readText(formData, name));
}

function parseSortOrder(raw: string): { error: string | null; value: number } {
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1) {
    return { error: "Urutan tampil harus berupa angka bulat positif.", value: 0 };
  }

  return { error: null, value: parsed };
}

function parseHealthConditionFormData(formData: FormData): ParsedHealthConditionInput {
  const slug = readText(formData, "slug").toLowerCase();
  const name = readText(formData, "name");
  const shortDescription = readText(formData, "short_description");
  const description = readText(formData, "description");
  const sortOrderResult = parseSortOrder(readText(formData, "sort_order"));

  if (!isValidSlug(slug)) {
    return { data: null, error: "Slug wajib huruf kecil, angka, atau tanda hubung." };
  }

  if (!name || !shortDescription || !description) {
    return {
      data: null,
      error: "Nama, ringkasan, dan deskripsi wajib diisi.",
    };
  }

  if (name.length > 120 || slug.length > 100) {
    return { data: null, error: "Beberapa isian melebihi batas panjang." };
  }

  if (sortOrderResult.error) {
    return { data: null, error: sortOrderResult.error };
  }

  return {
    data: {
      benefits: readLines(formData, "benefits"),
      description,
      linkedPlantNames: readLines(formData, "linked_plants"),
      name,
      short_description: shortDescription,
      slug,
      sort_order: sortOrderResult.value,
    },
    error: null,
  };
}

function errorCode(message: string) {
  if (message.includes("Slug")) {
    return "duplikat";
  }

  if (message.includes("admin")) {
    return "otorisasi";
  }

  return "validasi";
}

function revalidateHealthConditionPages(
  oldSlug?: string,
  newSlug?: string,
  linkedPlantSlugs: (string | null)[] = [],
) {
  revalidatePath("/");
  revalidatePath("/penyakit");
  revalidatePath("/admin");
  revalidatePath("/admin/penyakit");
  revalidatePath("/sitemap.xml");

  if (oldSlug) {
    revalidatePath(`/penyakit/${oldSlug}`);
  }

  if (newSlug && newSlug !== oldSlug) {
    revalidatePath(`/penyakit/${newSlug}`);
  }

  // A condition's linked plants show a reverse cross-link on their own
  // /tanaman/[slug] page, so every plant touched by this save -- whether it
  // was linked before or after the edit -- needs its page revalidated too.
  for (const plantSlug of linkedPlantSlugs) {
    if (plantSlug) {
      revalidatePath(`/tanaman/${plantSlug}`);
    }
  }
}

export async function createHealthConditionAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/penyakit/baru");

  if (!canEditContent(profile.role)) {
    redirect("/admin/penyakit?error=otorisasi");
  }

  const parsed = parseHealthConditionFormData(formData);

  if (parsed.error || !parsed.data) {
    redirect(`/admin/penyakit/baru?error=${errorCode(parsed.error ?? "validasi")}`);
  }

  const result = await createHealthCondition(parsed.data, user.id);

  if (result.error || !result.data) {
    redirect(`/admin/penyakit/baru?error=${errorCode(result.error ?? "gagal")}`);
  }

  const created = result.data;
  const createdDetail = await getHealthConditionByIdForAdmin(created.id);
  revalidateHealthConditionPages(
    undefined,
    created.slug,
    createdDetail.data?.linkedPlants.map((link) => link.plant_slug) ?? [],
  );
  redirect(`/admin/penyakit/${created.id}/edit?success=dibuat`);
}

export async function updateHealthConditionAction(id: string, formData: FormData) {
  const { profile, user } = await requireStaff(`/admin/penyakit/${id}/edit`);

  if (!canEditContent(profile.role)) {
    redirect(`/admin/penyakit/${id}/edit?error=otorisasi`);
  }

  const existing = await getHealthConditionByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/penyakit?error=tidak-ditemukan");
  }

  const currentCondition = existing.data;
  const parsed = parseHealthConditionFormData(formData);

  if (parsed.error || !parsed.data) {
    redirect(`/admin/penyakit/${id}/edit?error=${errorCode(parsed.error ?? "validasi")}`);
  }

  const result = await updateHealthCondition(id, parsed.data, user.id);

  if (result.error || !result.data) {
    redirect(`/admin/penyakit/${id}/edit?error=${errorCode(result.error ?? "gagal")}`);
  }

  const updatedDetail = await getHealthConditionByIdForAdmin(id);
  const linkedPlantSlugs = [
    ...currentCondition.linkedPlants.map((link) => link.plant_slug),
    ...(updatedDetail.data?.linkedPlants.map((link) => link.plant_slug) ?? []),
  ];
  revalidateHealthConditionPages(currentCondition.slug, result.data.slug, linkedPlantSlugs);
  redirect(`/admin/penyakit/${id}/edit?success=diperbarui`);
}

export async function deleteHealthConditionAction(formData: FormData) {
  const { profile } = await requireStaff("/admin/penyakit");
  const id = readText(formData, "id");
  const confirmed = formData.get("confirm_delete") === "permanen";

  if (!id || !canDeleteContent(profile.role) || !confirmed) {
    redirect("/admin/penyakit?error=hapus");
  }

  const existing = await getHealthConditionByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/penyakit?error=tidak-ditemukan");
  }

  const result = await deleteHealthCondition(id, profile.role);

  if (result.error) {
    redirect(`/admin/penyakit?error=${errorCode(result.error)}`);
  }

  revalidateHealthConditionPages(
    existing.data.slug,
    undefined,
    existing.data.linkedPlants.map((link) => link.plant_slug),
  );
  redirect("/admin/penyakit?success=dihapus");
}
