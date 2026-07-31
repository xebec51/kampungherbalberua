import { describe, expect, it } from "vitest";
import { getHealthZoneShortDescription } from "../../src/lib/content/health-zone-descriptions";

describe("getHealthZoneShortDescription", () => {
  it("mengembalikan deskripsi kurasi untuk zona lama yang sudah dikenal", () => {
    expect(getHealthZoneShortDescription("imunitas-kuat", "Zona Imunitas Kuat")).toContain(
      "Sistem imun",
    );
  });

  it("mengembalikan deskripsi asli (bukan string kosong) untuk zona baru tanpa kurasi manual", () => {
    // A zone newly added by a HerbaCode document update has no curated entry
    // yet. Its own title-shaped description must still be shown -- not
    // discarded into an empty string -- until a human curates it.
    expect(
      getHealthZoneShortDescription("gula-darah-terkendali", "Zona Gula Darah Terkendali"),
    ).toBe("Zona Gula Darah Terkendali");
  });

  it("mengembalikan string kosong hanya bila benar-benar tidak ada deskripsi sama sekali", () => {
    expect(getHealthZoneShortDescription("gula-darah-terkendali", null)).toBe("");
    expect(getHealthZoneShortDescription("gula-darah-terkendali", undefined)).toBe("");
  });
});
