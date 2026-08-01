import { beforeEach, describe, expect, it } from "vitest";
import {
  getHealthZoneQrTarget,
  getLegacyHealthZoneQrTarget,
  getPlantQrTarget,
  getStreetQrTarget,
} from "@/lib/qr/health-zone-qr";

describe("target QR zona kesehatan", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://kampungherbalberua.test/";
  });

  it("menggunakan qr_key publik dan URL absolut production untuk zona", () => {
    expect(getHealthZoneQrTarget("imunitas-kuat")).toBe(
      "https://kampungherbalberua.web.id/qr/zona/imunitas-kuat",
    );
  });

  it("menggunakan qr_key publik dan URL absolut production untuk jalan", () => {
    expect(getStreetQrTarget("digestia")).toBe(
      "https://kampungherbalberua.web.id/qr/jalan/digestia",
    );
  });

  it("tetap memakai domain production saat site URL bukan domain production", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test///";
    expect(getHealthZoneQrTarget("pencernaan-sehat")).toBe(
      "https://kampungherbalberua.web.id/qr/zona/pencernaan-sehat",
    );
  });

  it("menggunakan qr_key publik dan URL absolut production untuk tanaman", () => {
    expect(getPlantQrTarget("jahe-merah")).toBe(
      "https://kampungherbalberua.web.id/qr/tanaman/jahe-merah",
    );
  });

  it("menolak qr_key tidak valid", () => {
    expect(() => getHealthZoneQrTarget("khb-z01")).toThrow("QR key tidak valid.");
  });

  it("mempertahankan target lama hanya untuk kompatibilitas", () => {
    expect(getLegacyHealthZoneQrTarget("khb-z01")).toBe(
      "https://kampungherbalberua.test/z/khb-z01",
    );
  });
});
