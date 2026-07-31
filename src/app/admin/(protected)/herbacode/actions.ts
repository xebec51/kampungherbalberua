"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  setHerbaCodeEntryWorkflowForAdmin,
  updateHerbaCodeEntryForAdmin,
  type HerbaCodeEntryAdminInput,
} from "@/lib/data/admin/herbacode";
import { parseTextareaLines } from "@/lib/validation/content";
import { parseWorkflowActionFormData } from "@/lib/workflow/parse-workflow-action";

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
    redirect(`/admin/herbacode/${id}/edit?error=validasi`);
  }

  const result = await updateHerbaCodeEntryForAdmin(id, input, user.id);

  if (result.error) {
    redirect(`/admin/herbacode/${id}/edit?error=gagal`);
  }

  revalidateHerbaCodePages();
  redirect(`/admin/herbacode/${id}/edit?success=diperbarui`);
}

export async function setHerbaCodeWorkflowAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/herbacode");
  requireAdmin(profile.role);

  const id = readText(formData, "id");
  const actorName = profile.display_name?.trim() || user.email || null;

  if (!id) {
    redirect("/admin/herbacode?error=validasi");
  }

  const parsed = parseWorkflowActionFormData(formData);

  if (!parsed.ok) {
    redirect(`/admin/herbacode?error=${parsed.error}`);
  }

  const result = await setHerbaCodeEntryWorkflowForAdmin({
    action: parsed.action,
    actorId: user.id,
    actorName,
    id,
  });

  if (result.error) {
    redirect("/admin/herbacode?error=gagal");
  }

  revalidateHerbaCodePages();
  redirect("/admin/herbacode?success=status");
}
