import { beforeEach, describe, expect, it } from "vitest";
import { getHealthZoneQrTarget } from "@/lib/qr/health-zone-qr";

describe("target QR zona kesehatan", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://kampungherbalberua.test/";
  });

  it("menggunakan zone_code dan URL absolut", () => {
    expect(getHealthZoneQrTarget("khb-z01")).toBe(
      "https://kampungherbalberua.test/z/khb-z01",
    );
  });

  it("tidak menggunakan slug sebagai target permanen", () => {
    expect(getHealthZoneQrTarget("khb-z01")).not.toContain("digestia");
  });

  it("menormalisasi trailing slash site URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test///";
    expect(getHealthZoneQrTarget("khb-z09")).toBe("https://example.test/z/khb-z09");
  });

  it("menolak kode zona tidak valid", () => {
    expect(() => getHealthZoneQrTarget("KHB-Z01")).toThrow("Kode zona tidak valid.");
  });
});
