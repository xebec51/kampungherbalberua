import type { ContentStatus, ValidationStatus } from "@/lib/supabase/database.types";

// Shared across plants, health_zones, and herbacode_plant_zone_entries. Each
// table has slightly different column names for the same concepts
// (validation_checked_at vs validated_at), so this module works with a
// generic patch shape and the per-table DAL function maps it onto its own
// columns -- the *decision* of what a given action means lives in exactly
// one place.

export type WorkflowActionInput =
  | { type: "publish" }
  | { reason: string; type: "reject" }
  | { type: "archive" };

export type WorkflowPatch = {
  content_status: ContentStatus;
  validated_at?: string | null;
  validation_notes?: string | null;
  validation_status?: ValidationStatus;
  validator_id?: string | null;
  validator_name?: string | null;
};

export type WorkflowActor = {
  id: string;
  name: string | null;
};

const MIN_REJECT_REASON_LENGTH = 3;

export function isValidRejectReason(reason: string): boolean {
  return reason.trim().length >= MIN_REJECT_REASON_LENGTH;
}

// Pure and deterministic (given `now`) so it can be unit tested without a
// database: publish always sets verified+published+validator together in one
// object; reject always sets rejected+draft+reason together; archive only
// ever touches content_status. There is no code path that can produce a
// published+non-verified or published+rejected combination through this
// function -- the shape of WorkflowActionInput makes it structurally
// impossible, independent of the database trigger that also enforces it.
export function buildWorkflowPatch(
  action: WorkflowActionInput,
  actor: WorkflowActor,
  now: Date = new Date(),
): WorkflowPatch {
  switch (action.type) {
    case "publish":
      return {
        content_status: "published",
        validated_at: now.toISOString(),
        validation_status: "verified",
        validator_id: actor.id,
        validator_name: actor.name,
      };
    case "reject":
      return {
        content_status: "draft",
        validation_notes: action.reason.trim(),
        validation_status: "rejected",
      };
    case "archive":
      return {
        content_status: "archived",
      };
  }
}

export const workflowActionErrorMessages = {
  otorisasi: "Hanya admin yang dapat mengubah status konten.",
  reason_required: "Alasan wajib diisi saat menandai perlu perbaikan.",
  unknown: "Tindakan workflow tidak dikenali.",
} as const;
