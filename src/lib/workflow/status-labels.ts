import type { ContentStatus, ValidationStatus } from "@/lib/supabase/database.types";

// The six mandated Indonesian workflow-state labels. Derived from the
// (content_status, validation_status) pair rather than shown as two separate
// badges, so admin cards show one clear state instead of forcing staff to
// mentally combine two enums.
export type WorkflowStateLabel =
  | "Diarsipkan"
  | "Dipublikasikan"
  | "Draf"
  | "Menunggu pemeriksaan"
  | "Perlu perbaikan"
  | "Terverifikasi";

export type AdminStatusTone =
  | "archived"
  | "neutral"
  | "published"
  | "review"
  | "danger"
  | "verified"
  | "green"
  | "brown";

export type WorkflowState = {
  label: WorkflowStateLabel;
  tone: AdminStatusTone;
};

// Priority order matters: archived/published are terminal display states
// regardless of validation_status, rejected always surfaces as an actionable
// warning, and pending_review is treated as "awaiting a check" even if a
// stale validation_status disagrees.
export function getWorkflowState(
  contentStatus: ContentStatus,
  validationStatus: ValidationStatus,
): WorkflowState {
  if (contentStatus === "archived") {
    return { label: "Diarsipkan", tone: "archived" };
  }

  if (contentStatus === "published") {
    return { label: "Dipublikasikan", tone: "published" };
  }

  if (validationStatus === "rejected") {
    return { label: "Perlu perbaikan", tone: "danger" };
  }

  if (contentStatus === "pending_review") {
    return { label: "Menunggu pemeriksaan", tone: "review" };
  }

  if (validationStatus === "verified") {
    return { label: "Terverifikasi", tone: "verified" };
  }

  if (validationStatus === "pending") {
    return { label: "Menunggu pemeriksaan", tone: "review" };
  }

  return { label: "Draf", tone: "neutral" };
}
