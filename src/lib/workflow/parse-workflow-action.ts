import { isValidRejectReason, type WorkflowActionInput } from "@/lib/workflow/content-workflow";

export type ParsedWorkflowAction =
  | { action: WorkflowActionInput; ok: true }
  | { error: "alasan" | "validasi"; ok: false };

// Shared by every admin workflow server action (plants, health_zones,
// herbacode) so the three consolidated buttons (Validasi & Publikasikan /
// Tandai Perlu Perbaikan / Arsipkan) parse form data identically everywhere.
export function parseWorkflowActionFormData(
  formData: FormData,
): ParsedWorkflowAction {
  const type = formData.get("workflow_action");

  if (type === "publish" || type === "archive") {
    return { action: { type }, ok: true };
  }

  if (type === "reject") {
    const rawReason = formData.get("reason");
    const reason = typeof rawReason === "string" ? rawReason.trim() : "";

    if (!isValidRejectReason(reason)) {
      return { error: "alasan", ok: false };
    }

    return { action: { reason, type: "reject" }, ok: true };
  }

  return { error: "validasi", ok: false };
}
