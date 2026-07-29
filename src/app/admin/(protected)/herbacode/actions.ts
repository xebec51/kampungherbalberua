"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  setHerbaCodeEntryWorkflowForAdmin,
  updateHerbaCodeEntryForAdmin,
  type HerbaCodeEntryAdminInput,
} from "@/lib/data/admin/herbacode";
import {
  contentStatuses,
  isAllowed,
  parseTextareaLines,
  validationStatuses,
} from "@/lib/validation/content";
import type { ContentStatus, ValidationStatus } from "@/lib/supabase/database.types";

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalText(formData: FormData, name: string) {
  const value = readText(formData, name);
  return value.length > 0 ? value : null;
}

function readLines(formData: FormData, name: string) {
  return parseTextareaLines(readText(formData, name));
}

function requireAdmin(role: string) {
  if (role !== "admin") {
    redirect("/admin/herbacode?error=otorisasi");
  }
}

function revalidateHerbaCodePages() {
  revalidatePath("/");
  revalidatePath("/tanaman");
  revalidatePath("/zona-kesehatan");
  revalidatePath("/peta");
  revalidatePath("/admin");
  revalidatePath("/admin/herbacode");
  revalidatePath("/sitemap.xml");
}

export async function updateHerbaCodeEntryAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/herbacode");
  requireAdmin(profile.role);

  const id = readText(formData, "id");
  const input: HerbaCodeEntryAdminInput = {
    active_compounds: readLines(formData, "active_compounds"),
    benefits: readLines(formData, "benefits"),
    cultivation_techniques: readLines(formData, "cultivation_techniques"),
    local_name: readText(formData, "local_name"),
    preparation_methods: readLines(formData, "preparation_methods"),
    scientific_name: readOptionalText(formData, "scientific_name"),
    used_parts: readLines(formData, "used_parts"),
    warnings: readLines(formData, "warnings"),
  };

  if (!id || !input.local_name) {
    redirect("/admin/herbacode?error=validasi");
  }

  const result = await updateHerbaCodeEntryForAdmin(id, input, user.id);

  if (result.error) {
    redirect("/admin/herbacode?error=gagal");
  }

  revalidateHerbaCodePages();
  redirect("/admin/herbacode?success=diperbarui");
}

export async function setHerbaCodeWorkflowAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/herbacode");
  requireAdmin(profile.role);

  const id = readText(formData, "id");
  const contentStatus = readText(formData, "content_status");
  const validationStatus = readText(formData, "validation_status");
  const actorName = profile.display_name?.trim() || user.email || null;
  const input: {
    contentStatus?: ContentStatus;
    validationStatus?: ValidationStatus;
  } = {};

  if (!id) {
    redirect("/admin/herbacode?error=validasi");
  }

  if (contentStatus) {
    if (!isAllowed(contentStatus, contentStatuses)) {
      redirect("/admin/herbacode?error=validasi");
    }

    input.contentStatus = contentStatus;
  }

  if (validationStatus) {
    if (!isAllowed(validationStatus, validationStatuses)) {
      redirect("/admin/herbacode?error=validasi");
    }

    input.validationStatus = validationStatus;
  }

  const result = await setHerbaCodeEntryWorkflowForAdmin({
    actorId: user.id,
    actorName,
    id,
    ...input,
  });

  if (result.error) {
    redirect("/admin/herbacode?error=gagal");
  }

  revalidateHerbaCodePages();
  redirect("/admin/herbacode?success=status");
}
