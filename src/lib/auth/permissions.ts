import type { AppRole } from "@/lib/supabase/database.types";

export type StaffRole = Extract<AppRole, "admin">;

const staffRoles: readonly StaffRole[] = ["admin"];

export function isStaffRole(role: AppRole | null | undefined): role is StaffRole {
  return typeof role === "string" && staffRoles.includes(role as StaffRole);
}

export function canEditContent(role: AppRole | null | undefined): boolean {
  return role === "admin";
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
