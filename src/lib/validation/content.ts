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

const editorContentStatuses = ["draft", "pending_review"] as const;
const editorValidationStatuses = ["data_demonstrasi", "pending"] as const;

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
  if (role === "admin") {
    return true;
  }

  if (role === "editor") {
    return isAllowed(status, editorContentStatuses);
  }

  return false;
}

export function canRoleUseValidationStatus(
  role: AppRole | string,
  status: ValidationStatus,
) {
  if (role === "admin") {
    return true;
  }

  if (role === "editor") {
    return isAllowed(status, editorValidationStatuses);
  }

  return false;
}

export function hasVerifiedRequirements(
  validationStatus: ValidationStatus,
  validatorName: string | null,
  sourceNotes: string | string[] | null,
) {
  if (validationStatus !== "verified") {
    return true;
  }

  const hasValidator = Boolean(validatorName?.trim());
  const hasSource = Array.isArray(sourceNotes)
    ? sourceNotes.some((source) => source.trim().length > 0)
    : Boolean(sourceNotes?.trim());

  return hasValidator && hasSource;
}
