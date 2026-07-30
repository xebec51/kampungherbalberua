import { describe, expect, it } from "vitest";
import {
  canPublishWithValidation,
  canRoleUseContentStatus,
  canRoleUseValidationStatus,
  hasVerifiedRequirements,
  isValidSlug,
  isValidZoneCode,
  normalizeImagePath,
  parseTextareaLines,
} from "@/lib/validation/content";

describe("slug tanaman", () => {
  it("menerima lowercase dan tanda hubung yang valid", () => {
    expect(isValidSlug("jahe")).toBe(true);
    expect(isValidSlug("jahe-merah")).toBe(true);
  });

  it("menolak spasi, uppercase, kosong, dan tanda hubung awal/akhir", () => {
    expect(isValidSlug("jahe merah")).toBe(false);
    expect(isValidSlug("Jahe")).toBe(false);
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("-jahe")).toBe(false);
    expect(isValidSlug("jahe-")).toBe(false);
  });
});

describe("zone code", () => {
  it("menerima kode permanen lowercase dua digit", () => {
    expect(isValidZoneCode("khb-z01")).toBe(true);
    expect(isValidZoneCode("khb-z09")).toBe(true);
  });

  it("menolak kode tidak sesuai format", () => {
    expect(isValidZoneCode("khb-z1")).toBe(false);
    expect(isValidZoneCode("KHB-Z01")).toBe(false);
    expect(isValidZoneCode("")).toBe(false);
    expect(isValidZoneCode("khb-z01-extra")).toBe(false);
  });
});

describe("input array", () => {
  it("membersihkan whitespace, membuang baris kosong, dan mempertahankan urutan", () => {
    expect(parseTextareaLines("  E1-10  \n\n H1-5\n  J2-4 ")).toEqual([
      "E1-10",
      "H1-5",
      "J2-4",
    ]);
  });
});

describe("image path", () => {
  it("menerima path lokal /images dan mengubah string kosong menjadi null", () => {
    expect(normalizeImagePath("/images/zones/digestia.jpg")).toEqual({
      error: null,
      value: "/images/zones/digestia.jpg",
    });
    expect(normalizeImagePath("   ")).toEqual({ error: null, value: null });
  });

  it("menolak URL eksternal dan javascript URL", () => {
    expect(normalizeImagePath("https://example.com/image.jpg").error).not.toBeNull();
    expect(normalizeImagePath("javascript:alert(1)").error).not.toBeNull();
  });
});

describe("workflow status", () => {
  it("menolak editor untuk semua status konten admin", () => {
    expect(canRoleUseContentStatus("editor", "draft")).toBe(false);
    expect(canRoleUseContentStatus("editor", "pending_review")).toBe(false);
    expect(canRoleUseContentStatus("editor", "published")).toBe(false);
    expect(canRoleUseContentStatus("editor", "archived")).toBe(false);
  });

  it("mengizinkan admin memakai seluruh status konten", () => {
    expect(canRoleUseContentStatus("admin", "draft")).toBe(true);
    expect(canRoleUseContentStatus("admin", "pending_review")).toBe(true);
    expect(canRoleUseContentStatus("admin", "published")).toBe(true);
    expect(canRoleUseContentStatus("admin", "archived")).toBe(true);
  });

  it("mewajibkan pemeriksa, sumber, dan tanggal untuk verified", () => {
    expect(hasVerifiedRequirements("verified", null, ["Sumber"], "2026-07-30")).toBe(false);
    expect(hasVerifiedRequirements("verified", "Pemeriksa", [], "2026-07-30")).toBe(false);
    expect(hasVerifiedRequirements("verified", "Pemeriksa", ["Sumber"], null)).toBe(false);
    expect(hasVerifiedRequirements("verified", "Pemeriksa", ["Sumber"], "2026-07-30")).toBe(true);
    expect(hasVerifiedRequirements("pending", null, [])).toBe(true);
  });

  it("menolak editor untuk semua status validasi admin", () => {
    expect(canRoleUseValidationStatus("editor", "data_demonstrasi")).toBe(false);
    expect(canRoleUseValidationStatus("editor", "pending")).toBe(false);
    expect(canRoleUseValidationStatus("editor", "verified")).toBe(false);
    expect(canRoleUseValidationStatus("editor", "rejected")).toBe(false);
  });

  it("mencegah published tanpa metadata verified lengkap", () => {
    expect(
      canPublishWithValidation({
        checkedAt: "2026-07-30",
        checkerName: "Pemeriksa",
        contentStatus: "published",
        sourceNotes: ["Sumber"],
        validationStatus: "verified",
      }),
    ).toBe(true);
    expect(
      canPublishWithValidation({
        checkedAt: "2026-07-30",
        checkerName: "Pemeriksa",
        contentStatus: "published",
        sourceNotes: ["Sumber"],
        validationStatus: "pending",
      }),
    ).toBe(false);
  });
});
