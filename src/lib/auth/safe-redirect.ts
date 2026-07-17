export function getSafeAdminRedirect(
  value: FormDataEntryValue | string | null | undefined,
  fallback = "/admin",
) {
  const redirectTo = typeof value === "string" ? value.trim() : "";

  if (
    redirectTo.length === 0 ||
    !redirectTo.startsWith("/admin") ||
    redirectTo.startsWith("//") ||
    redirectTo.includes("://") ||
    redirectTo.includes("\\")
  ) {
    return fallback;
  }

  return redirectTo;
}
