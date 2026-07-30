import type {
  AppRole,
  ContentStatus,
  PlantCategory,
  ValidationStatus,
} from "@/lib/supabase/database.types";

export const contentStatuses = [
  "draft",
  "pending_review",
  "published",
  "archived",
] as const satisfies readonly ContentStatus[];

export const validationStatuses = [
  "data_demonstrasi",
  "pending",
  "verified",
  "rejected",
] as const satisfies readonly ValidationStatus[];

export const plantCategories = [
  "rimpang",
  "daun",
  "bunga",
  "batang",
  "lainnya",
] as const satisfies readonly PlantCategory[];

export function isAllowed<T extends string>(
  value: string,
  options: readonly T[],
): value is T {
  return options.includes(value as T);
}

export function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function isValidZoneCode(value: string) {
  return /^khb-z[0-9]{2}$/.test(value);
}

export function parseTextareaLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function normalizeOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeImagePath(value: string) {
  const imagePath = normalizeOptionalText(value);

  if (!imagePath) {
    return { error: null, value: null };
  }

  if (
    !imagePath.startsWith("/images/") ||
    imagePath.toLowerCase().includes("javascript:") ||
    imagePath.includes("://")
  ) {
    return {
      error: "Path gambar harus lokal dan diawali /images/.",
      value: null,
    };
  }

  return { error: null, value: imagePath };
}

export function canRoleUseContentStatus(
  role: AppRole | string,
  status: ContentStatus,
) {
  void status;
  return role === "admin";
}

export function canRoleUseValidationStatus(
  role: AppRole | string,
  status: ValidationStatus,
) {
  void status;
  return role === "admin";
}

export function hasVerifiedRequirements(
  validationStatus: ValidationStatus,
  checkerName: string | null,
  sourceNotes: string | string[] | null,
  checkedAt: string | null = null,
) {
  if (validationStatus !== "verified") {
    return true;
  }

  const hasChecker = Boolean(checkerName?.trim());
  const hasSource = Array.isArray(sourceNotes)
    ? sourceNotes.some((source) => source.trim().length > 0)
    : Boolean(sourceNotes?.trim());
  const hasCheckedAt = Boolean(checkedAt?.trim());

  return hasChecker && hasSource && hasCheckedAt;
}

export function canPublishWithValidation(input: {
  checkedAt: string | null;
  checkerName: string | null;
  contentStatus: ContentStatus;
  sourceNotes: string | string[] | null;
  validationStatus: ValidationStatus;
}) {
  if (input.contentStatus !== "published") {
    return true;
  }

  if (input.validationStatus !== "verified") {
    return false;
  }

  return hasVerifiedRequirements(
    input.validationStatus,
    input.checkerName,
    input.sourceNotes,
    input.checkedAt,
  );
}
