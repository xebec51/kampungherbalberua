import { describe, expect, it } from "vitest";
import {
  buildWorkflowPatch,
  isValidRejectReason,
} from "@/lib/workflow/content-workflow";
import { parseWorkflowActionFormData } from "@/lib/workflow/parse-workflow-action";
import { getWorkflowState } from "@/lib/workflow/status-labels";

const actor = { id: "actor-1", name: "Admin Berua" };
const now = new Date("2026-07-31T09:00:00.000Z");

describe("buildWorkflowPatch", () => {
  it("Validasi & Publikasikan mengubah validation_status dan content_status sekaligus", () => {
    const patch = buildWorkflowPatch({ type: "publish" }, actor, now);

    expect(patch.content_status).toBe("published");
    expect(patch.validation_status).toBe("verified");
    expect(patch.validator_id).toBe(actor.id);
    expect(patch.validator_name).toBe(actor.name);
    expect(patch.validated_at).toBe(now.toISOString());
  });

  it("Tandai Perlu Perbaikan menghasilkan draft+rejected dan menyimpan alasan", () => {
    const patch = buildWorkflowPatch(
      { reason: "Sumber belum lengkap", type: "reject" },
      actor,
      now,
    );

    expect(patch.content_status).toBe("draft");
    expect(patch.validation_status).toBe("rejected");
    expect(patch.validation_notes).toBe("Sumber belum lengkap");
  });

  it("Tandai Perlu Perbaikan tidak pernah menghasilkan published+rejected", () => {
    const patch = buildWorkflowPatch({ reason: "x".repeat(5), type: "reject" }, actor, now);

    expect(patch.content_status).not.toBe("published");
  });

  it("Arsipkan hanya mengubah content_status, tidak menyentuh field validasi", () => {
    const patch = buildWorkflowPatch({ type: "archive" }, actor, now);

    expect(patch.content_status).toBe("archived");
    expect(patch.validation_status).toBeUndefined();
    expect(patch.validator_id).toBeUndefined();
    expect(patch.validator_name).toBeUndefined();
    expect(patch.validated_at).toBeUndefined();
    expect(patch.validation_notes).toBeUndefined();
  });

  it("alasan ditrim sebelum disimpan", () => {
    const patch = buildWorkflowPatch(
      { reason: "  perlu foto lebih jelas  ", type: "reject" },
      actor,
      now,
    );

    expect(patch.validation_notes).toBe("perlu foto lebih jelas");
  });
});

describe("isValidRejectReason", () => {
  it("menolak alasan kosong atau terlalu pendek", () => {
    expect(isValidRejectReason("")).toBe(false);
    expect(isValidRejectReason("  ")).toBe(false);
    expect(isValidRejectReason("ab")).toBe(false);
  });

  it("menerima alasan yang cukup panjang setelah trim", () => {
    expect(isValidRejectReason("  data usang  ")).toBe(true);
  });
});

describe("parseWorkflowActionFormData", () => {
  it("mem-parse publish tanpa field tambahan", () => {
    const formData = new FormData();
    formData.set("workflow_action", "publish");

    const parsed = parseWorkflowActionFormData(formData);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.action).toEqual({ type: "publish" });
    }
  });

  it("mem-parse archive tanpa field tambahan", () => {
    const formData = new FormData();
    formData.set("workflow_action", "archive");

    const parsed = parseWorkflowActionFormData(formData);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.action).toEqual({ type: "archive" });
    }
  });

  it("menolak reject tanpa alasan yang valid", () => {
    const formData = new FormData();
    formData.set("workflow_action", "reject");
    formData.set("reason", "ab");

    const parsed = parseWorkflowActionFormData(formData);

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toBe("alasan");
    }
  });

  it("menerima reject dengan alasan valid", () => {
    const formData = new FormData();
    formData.set("workflow_action", "reject");
    formData.set("reason", "Sumber belum jelas");

    const parsed = parseWorkflowActionFormData(formData);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.action).toEqual({
        reason: "Sumber belum jelas",
        type: "reject",
      });
    }
  });

  it("menolak workflow_action yang tidak dikenal", () => {
    const formData = new FormData();
    formData.set("workflow_action", "unlist");

    const parsed = parseWorkflowActionFormData(formData);

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toBe("validasi");
    }
  });
});

describe("getWorkflowState", () => {
  it("archived selalu menjadi Diarsipkan terlepas dari validation_status", () => {
    expect(getWorkflowState("archived", "verified").label).toBe("Diarsipkan");
    expect(getWorkflowState("archived", "rejected").label).toBe("Diarsipkan");
  });

  it("published menjadi Dipublikasikan", () => {
    expect(getWorkflowState("published", "verified").label).toBe("Dipublikasikan");
  });

  it("draft+rejected menjadi Perlu perbaikan", () => {
    expect(getWorkflowState("draft", "rejected").label).toBe("Perlu perbaikan");
  });

  it("pending_review menjadi Menunggu pemeriksaan", () => {
    expect(getWorkflowState("pending_review", "pending").label).toBe(
      "Menunggu pemeriksaan",
    );
  });

  it("draft+verified menjadi Terverifikasi", () => {
    expect(getWorkflowState("draft", "verified").label).toBe("Terverifikasi");
  });

  it("draft+pending menjadi Menunggu pemeriksaan", () => {
    expect(getWorkflowState("draft", "pending").label).toBe("Menunggu pemeriksaan");
  });

  it("draft+data_demonstrasi menjadi Draf", () => {
    expect(getWorkflowState("draft", "data_demonstrasi").label).toBe("Draf");
  });
});
