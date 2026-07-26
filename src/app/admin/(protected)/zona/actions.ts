"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canDeleteContent,
  canEditContent,
} from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  createHealthZone,
  deleteHealthZone,
  getHealthZoneByIdForAdmin,
  updateHealthZone,
  type HealthZoneAdminInput,
  type HealthZoneAdminRecord,
} from "@/lib/data/admin/health-zones";
import {
  canRoleUseContentStatus,
  canRoleUseValidationStatus,
  contentStatuses,
  hasVerifiedRequirements,
  isAllowed,
  isValidSlug,
  isValidZoneCode,
  normalizeImagePath,
  normalizeOptionalText,
  parseTextareaLines,
  validationStatuses,
} from "@/lib/validation/content";

type ParsedZoneInput =
  | {
      data: HealthZoneAdminInput;
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

function parseZoneFormData(formData: FormData, role: string): ParsedZoneInput {
  const zoneCode = readText(formData, "zone_code").toLowerCase();
  const slug = readText(formData, "slug").toLowerCase();
  const programName = readText(formData, "program_name");
  const streetName = readText(formData, "street_name");
  const zoneName = readText(formData, "zone_name");
  const healthTopic = readText(formData, "health_topic");
  const shortDescription = readText(formData, "short_description");
  const overview = readText(formData, "overview");
  const contentStatus = readText(formData, "content_status");
  const validationStatus = readText(formData, "validation_status");
  const imagePathResult = normalizeImagePath(readText(formData, "image_path"));
  const validatorName = readOptionalText(formData, "validator_name");
  const sourceNotes = readLines(formData, "source_notes");
  const blockRanges = readLines(formData, "block_ranges");

  if (!isValidZoneCode(zoneCode)) {
    return { data: null, error: "Kode zona wajib mengikuti format khb-zNN." };
  }

  if (!isValidSlug(slug)) {
    return { data: null, error: "Slug wajib huruf kecil, angka, atau tanda hubung." };
  }

  if (
    !programName ||
    !streetName ||
    !zoneName ||
    !healthTopic ||
    !shortDescription ||
    !overview
  ) {
    return { data: null, error: "Isian wajib zona belum lengkap." };
  }

  if (blockRanges.length === 0) {
    return { data: null, error: "Blok zona wajib diisi minimal satu baris." };
  }

  if (
    zoneCode.length > 20 ||
    slug.length > 100 ||
    programName.length > 120 ||
    streetName.length > 120 ||
    zoneName.length > 160 ||
    shortDescription.length > 320
  ) {
    return { data: null, error: "Beberapa isian zona melebihi batas panjang." };
  }

  if (!isAllowed(contentStatus, contentStatuses)) {
    return { data: null, error: "Status konten tidak valid." };
  }

  if (!isAllowed(validationStatus, validationStatuses)) {
    return { data: null, error: "Status validasi tidak valid." };
  }

  if (
    role === "editor" &&
    (!canRoleUseContentStatus(role, contentStatus) ||
      !canRoleUseValidationStatus(role, validationStatus))
  ) {
    return {
      data: null,
      error: "Editor hanya dapat menyimpan draft atau pending review.",
    };
  }

  if (!hasVerifiedRequirements(validationStatus, validatorName, sourceNotes)) {
    return {
      data: null,
      error: "Status terverifikasi wajib memiliki validator dan sumber.",
    };
  }

  if (imagePathResult.error) {
    return { data: null, error: imagePathResult.error };
  }

  return {
    data: {
      block_ranges: blockRanges,
      content_status: contentStatus,
      educational_points: readLines(formData, "educational_points"),
      featured: formData.get("featured") === "on",
      health_topic: healthTopic,
      healthy_habits: readLines(formData, "healthy_habits"),
      image_path: imagePathResult.value,
      important_notes: readLines(formData, "important_notes"),
      location_notes: readOptionalText(formData, "location_notes"),
      overview,
      program_name: programName,
      short_description: shortDescription,
      sign_text: readOptionalText(formData, "sign_text"),
      slug,
      source_notes: sourceNotes,
      street_name: streetName,
      validation_status: validationStatus,
      validator_name: validatorName,
      zone_code: zoneCode,
      zone_name: zoneName,
    },
    error: null,
  };
}

function zoneRecordToInput(zone: HealthZoneAdminRecord): HealthZoneAdminInput {
  return {
    block_ranges: zone.block_ranges,
    content_status: zone.content_status,
    educational_points: zone.educational_points,
    featured: zone.featured,
    health_topic: zone.health_topic,
    healthy_habits: zone.healthy_habits,
    image_path: zone.image_path,
    important_notes: zone.important_notes,
    location_notes: zone.location_notes,
    overview: zone.overview,
    program_name: zone.program_name,
    short_description: zone.short_description,
    sign_text: zone.sign_text,
    slug: zone.slug,
    source_notes: zone.source_notes,
    street_name: zone.street_name,
    validation_status: zone.validation_status,
    validator_name: zone.validator_name,
    zone_code: zone.zone_code,
    zone_name: zone.zone_name,
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

function revalidateZonePages(
  oldSlug?: string,
  newSlug?: string,
  oldCode?: string,
  newCode?: string,
) {
  revalidatePath("/");
  revalidatePath("/peta");
  revalidatePath("/zona-kesehatan");
  revalidatePath("/admin");
  revalidatePath("/admin/zona");
  revalidatePath("/sitemap.xml");

  if (oldSlug) {
    revalidatePath(`/zona-kesehatan/${oldSlug}`);
  }

  if (newSlug && newSlug !== oldSlug) {
    revalidatePath(`/zona-kesehatan/${newSlug}`);
  }

  if (oldCode) {
    revalidatePath(`/z/${oldCode}`);
  }

  if (newCode && newCode !== oldCode) {
    revalidatePath(`/z/${newCode}`);
  }
}

export async function createHealthZoneAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/zona/baru");

  if (!canEditContent(profile.role)) {
    redirect("/admin/zona?error=readonly");
  }

  const parsed = parseZoneFormData(formData, profile.role);

  if (parsed.error || !parsed.data) {
    redirect(`/admin/zona/baru?error=${errorCode(parsed.error ?? "validasi")}`);
  }

  const result = await createHealthZone(parsed.data, user.id);

  if (result.error || !result.data) {
    redirect(`/admin/zona/baru?error=${errorCode(result.error ?? "gagal")}`);
  }

  const createdZone = result.data;
  revalidateZonePages(undefined, createdZone.slug, undefined, createdZone.zone_code);
  redirect(`/admin/zona/${createdZone.id}/edit?success=dibuat`);
}

export async function updateHealthZoneAction(id: string, formData: FormData) {
  const { profile, user } = await requireStaff(`/admin/zona/${id}/edit`);

  if (!canEditContent(profile.role)) {
    redirect(`/admin/zona/${id}/edit?error=readonly`);
  }

  const existing = await getHealthZoneByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/zona?error=tidak-ditemukan");
  }

  const currentZone = existing.data;

  if (
    profile.role === "editor" &&
    !["draft", "pending_review"].includes(currentZone.content_status)
  ) {
    redirect(`/admin/zona/${id}/edit?error=otorisasi`);
  }

  const parsed = parseZoneFormData(formData, profile.role);

  if (parsed.error || !parsed.data) {
    redirect(`/admin/zona/${id}/edit?error=${errorCode(parsed.error ?? "validasi")}`);
  }

  if (currentZone.published_at && parsed.data.zone_code !== currentZone.zone_code) {
    redirect(`/admin/zona/${id}/edit?error=kode-permanen`);
  }

  const result = await updateHealthZone(
    id,
    parsed.data,
    user.id,
    currentZone.published_at,
  );

  if (result.error || !result.data) {
    redirect(`/admin/zona/${id}/edit?error=${errorCode(result.error ?? "gagal")}`);
  }

  const updatedZone = result.data;
  revalidateZonePages(
    currentZone.slug,
    updatedZone.slug,
    currentZone.zone_code,
    updatedZone.zone_code,
  );
  redirect(`/admin/zona/${id}/edit?success=diperbarui`);
}

export async function archiveHealthZoneAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/zona");
  const id = readText(formData, "id");

  if (!id || profile.role !== "admin") {
    redirect("/admin/zona?error=otorisasi");
  }

  const existing = await getHealthZoneByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/zona?error=tidak-ditemukan");
  }

  const input = {
    ...zoneRecordToInput(existing.data),
    content_status: "archived" as const,
  };
  const result = await updateHealthZone(
    id,
    input,
    user.id,
    existing.data.published_at,
  );

  if (result.error || !result.data) {
    redirect(`/admin/zona?error=${errorCode(result.error ?? "gagal")}`);
  }

  revalidateZonePages(
    existing.data.slug,
    result.data.slug,
    existing.data.zone_code,
    result.data.zone_code,
  );
  redirect("/admin/zona?success=diarsipkan");
}

export async function deleteHealthZoneAction(formData: FormData) {
  const { profile } = await requireStaff("/admin/zona");
  const id = readText(formData, "id");
  const confirmed = formData.get("confirm_delete") === "permanen";

  if (!id || !canDeleteContent(profile.role) || !confirmed) {
    redirect("/admin/zona?error=hapus");
  }

  const existing = await getHealthZoneByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/zona?error=tidak-ditemukan");
  }

  const result = await deleteHealthZone(id, profile.role);

  if (result.error) {
    redirect(`/admin/zona?error=${errorCode(result.error)}`);
  }

  revalidateZonePages(existing.data.slug, undefined, existing.data.zone_code);
  redirect("/admin/zona?success=dihapus");
}
