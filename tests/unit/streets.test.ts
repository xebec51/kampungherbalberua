import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  getStreetZoneMappingByStreetSlug,
  getStreetZoneMappingByZoneSlug,
  STREET_ZONE_MAPPINGS,
} from "../../src/lib/data/street-zone-mapping";
import {
  getPublishedStreetQrTargetByKey,
  getRestoredStreetNamesByHerbaCodeZoneSlug,
  localStreetPlantEntries,
  thematicStreetSeeds,
} from "../../src/lib/data/streets";
import localHerbaCodeData from "../../data/herbacode/herbacode-data.json";

const EXPECTED_PAIRS = [
  ["digestia", "pencernaan-sehat"],
  ["respiria", "pernapasan-lega"],
  ["glycemia", "gula-darah-terkendali"],
  ["lipidia", "obesitas-dan-metabolik"],
  ["imun", "imunitas-kuat"],
  ["hepatia", "hati-sehat"],
  ["feminia", "kesehatan-perempuan"],
  ["vaskulia", "jantung-sehat"],
  ["pediatria", "anak-ceria"],
] as const;

describe("STREET_ZONE_MAPPINGS", () => {
  it("berisi tepat 9 pasangan jalan-zona", () => {
    expect(STREET_ZONE_MAPPINGS).toHaveLength(9);
  });

  it("setiap jalan mempunyai tepat satu zona sesuai pemetaan resmi", () => {
    for (const [streetSlug, zoneSlug] of EXPECTED_PAIRS) {
      const mapping = getStreetZoneMappingByStreetSlug(streetSlug);
      expect(mapping?.zoneSlug).toBe(zoneSlug);
    }
  });

  it("setiap zona target mempunyai jalan yang benar (tidak ada pasangan terbalik)", () => {
    for (const [streetSlug, zoneSlug] of EXPECTED_PAIRS) {
      const mapping = getStreetZoneMappingByZoneSlug(zoneSlug);
      expect(mapping?.streetSlug).toBe(streetSlug);
    }
  });

  it("tidak ada slug jalan atau zona yang duplikat", () => {
    const streetSlugs = STREET_ZONE_MAPPINGS.map((m) => m.streetSlug);
    const zoneSlugs = STREET_ZONE_MAPPINGS.map((m) => m.zoneSlug);
    expect(new Set(streetSlugs).size).toBe(9);
    expect(new Set(zoneSlugs).size).toBe(9);
  });

  it("thematicStreetSeeds memuat slug dan qrKey yang identik dengan STREET_ZONE_MAPPINGS", () => {
    expect(thematicStreetSeeds).toHaveLength(9);
    const seedSlugs = new Set(thematicStreetSeeds.map((s) => s.slug));
    const seedQrKeys = new Set(thematicStreetSeeds.map((s) => s.qrKey));
    for (const mapping of STREET_ZONE_MAPPINGS) {
      expect(seedSlugs.has(mapping.streetSlug)).toBe(true);
      expect(seedQrKeys.has(mapping.streetQrKey)).toBe(true);
    }
  });
});

describe("getRestoredStreetNamesByHerbaCodeZoneSlug", () => {
  it("mencakup seluruh 9 zona pada pemetaan resmi", async () => {
    for (const [, zoneSlug] of EXPECTED_PAIRS) {
      const names = await getRestoredStreetNamesByHerbaCodeZoneSlug(zoneSlug);
      expect(names.length).toBeGreaterThan(0);
    }
  });

  it("mengembalikan nama jalan yang benar untuk setiap zona (tidak tertukar)", async () => {
    for (const [streetSlug, zoneSlug] of EXPECTED_PAIRS) {
      const names = await getRestoredStreetNamesByHerbaCodeZoneSlug(zoneSlug);
      const expectedStreetName = getStreetZoneMappingByStreetSlug(streetSlug)?.streetName;
      expect(names).toEqual([expectedStreetName]);
    }
  });

  it("mengembalikan array kosong untuk zona yang tidak punya jalan pasangan", async () => {
    const names = await getRestoredStreetNamesByHerbaCodeZoneSlug("otak-cerdas");
    expect(names).toEqual([]);
  });
});

describe("localStreetPlantEntries", () => {
  it("sama dengan entri lokal HerbaCode yang difilter berdasarkan zoneSlug, terurut entry_order", () => {
    for (const [, zoneSlug] of EXPECTED_PAIRS) {
      const expected = localHerbaCodeData.entries
        .filter((entry) => entry.zoneSlug === zoneSlug)
        .sort(
          (left, right) =>
            left.entryOrder - right.entryOrder ||
            left.localName.localeCompare(right.localName, "id"),
        )
        .map((entry) => entry.plantSlug);

      const actual = localStreetPlantEntries(zoneSlug).map((entry) => entry.plantSlug);
      expect(actual).toEqual(expected);
    }
  });

  it("urutan mengikuti entry_order (sortOrder naik monoton atau sama)", () => {
    for (const [, zoneSlug] of EXPECTED_PAIRS) {
      const entries = localStreetPlantEntries(zoneSlug);
      for (let i = 1; i < entries.length; i += 1) {
        expect(entries[i]!.sortOrder).toBeGreaterThanOrEqual(entries[i - 1]!.sortOrder);
      }
    }
  });

  it("mengembalikan array kosong untuk zoneSlug yang tidak dikenal", () => {
    expect(localStreetPlantEntries("zona-tidak-ada")).toEqual([]);
  });
});

describe("getPublishedStreetQrTargetByKey", () => {
  it("QR jalan tetap mengarah ke halaman jalan (slug jalan), bukan slug zona", async () => {
    for (const [streetSlug, zoneSlug] of EXPECTED_PAIRS) {
      const target = await getPublishedStreetQrTargetByKey(streetSlug);
      expect(target?.slug).toBe(streetSlug);
      expect(target?.slug).not.toBe(zoneSlug);
    }
  });
});

describe("streets.ts: tidak lagi memakai katalog poster sebagai sumber plantEntries", () => {
  it("kode sumber streets.ts tidak mereferensikan posterPlantManifest atau catalogCollectionTitle", () => {
    const source = readFileSync("src/lib/data/streets.ts", "utf8");
    expect(source).not.toContain("posterPlantManifest");
    expect(source).not.toContain("catalogCollectionTitle");
    expect(source).not.toContain("normalizePosterName");
  });
});
