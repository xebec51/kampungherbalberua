import type { AppRole } from "@/lib/supabase/database.types";

export type StaffRole = Exclude<AppRole, "viewer">;

const staffRoles: readonly StaffRole[] = ["editor", "validator", "admin"];

export function isStaffRole(role: AppRole | null | undefined): role is StaffRole {
  return typeof role === "string" && staffRoles.includes(role as StaffRole);
}

export function canEditContent(role: AppRole | null | undefined): boolean {
  return role === "editor" || role === "admin";
}

export function canPublishContent(role: AppRole | null | undefined): boolean {
  return role === "admin";
}

export function canDeleteContent(role: AppRole | null | undefined): boolean {
  return role === "admin";
}

export function canValidateContent(role: AppRole | null | undefined): boolean {
  return role === "admin";
}
