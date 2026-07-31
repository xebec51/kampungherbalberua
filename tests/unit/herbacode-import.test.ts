import { describe, expect, it } from "vitest";
import {
  applyResolvedZoneCodes,
  buildAmbiguousScientificNameGroups,
  buildExistingPlantIndexes,
  findExistingPlantMatch,
  resolveZones,
  type HealthZoneRow,
  type ImportPlanPlant,
  type PlantRow,
} from "../../scripts/herbacode/import";
import type { HerbaCodeData, HerbaCodeEntry, HerbaCodePlant, HerbaCodeZone } from "../../scripts/herbacode/extract";

function zone(title: string, displayOrder: number, slugOverride?: string): HerbaCodeZone {
  const slug = slugOverride ?? title.replace(/^Zona\s+/i, "").toLowerCase().replace(/\s+/g, "-");

  return {
    displayOrder,
    rawTitle: title,
    slug,
    title,
    titleCorrection: null,
    zoneCode: `khb-z${String(displayOrder).padStart(2, "0")}`,
  };
}

function healthZoneRow(
  zoneCode: string,
  zoneName: string,
  slug?: string,
): HealthZoneRow {
  return {
    id: `id-${zoneCode}`,
    slug: slug ?? zoneName.replace(/^Zona\s+/i, "").toLowerCase().replace(/\s+/g, "-"),
    zone_code: zoneCode,
    zone_name: zoneName,
  };
}

describe("resolveZones", () => {
  it("mempertahankan zone_code 9 zona lama melalui mapping legacy eksplisit, bukan urutan dokumen", () => {
    // In the new document these 9 titles no longer appear in their original
    // occurrence order (some move to positions 11-14), yet their zone_code
    // must stay exactly what production already has.
    const zones = [
      zone("Zona Imunitas Kuat", 1),
      zone("Zona Pencernaan Sehat", 2),
      zone("Zona Ginjal Sehat", 3),
      zone("Zona Hati Sehat", 4),
      zone("Zona Jantung Sehat", 5),
      zone("Zona Gula Darah Terkendali", 6),
      zone("Zona Tulang & Sendi", 11),
      zone("Zona Kesehatan Mulut", 12),
      zone("Zona Anti Mikroba", 13),
      zone("Zona Kesehatan Perempuan", 14),
    ];
    const existingZones: HealthZoneRow[] = [
      healthZoneRow("khb-z01", "Zona Imunitas Kuat"),
      healthZoneRow("khb-z02", "Zona Pencernaan Sehat"),
      healthZoneRow("khb-z03", "Zona Ginjal Sehat"),
      healthZoneRow("khb-z04", "Zona Hati Sehat"),
      healthZoneRow("khb-z05", "Zona Jantung Sehat"),
      healthZoneRow("khb-z06", "Zona Tulang & Sendi"),
      healthZoneRow("khb-z07", "Zona Kesehatan Mulut"),
      healthZoneRow("khb-z08", "Zona Anti Mikroba"),
      healthZoneRow("khb-z09", "Zona Kesehatan Perempuan"),
    ];

    const resolutions = resolveZones(zones, existingZones);

    expect(resolutions.get("tulang-&-sendi")?.zoneCode).toBe("khb-z06");
    expect(resolutions.get("kesehatan-mulut")?.zoneCode).toBe("khb-z07");
    expect(resolutions.get("anti-mikroba")?.zoneCode).toBe("khb-z08");
    expect(resolutions.get("kesehatan-perempuan")?.zoneCode).toBe("khb-z09");
    for (const slug of ["tulang-&-sendi", "kesehatan-mulut", "anti-mikroba", "kesehatan-perempuan"]) {
      expect(resolutions.get(slug)?.isNew).toBe(false);
      expect(resolutions.get(slug)?.matchMethod).toBe("legacy");
    }

    // A genuinely new zone (not one of the 9 legacy titles) gets a fresh code
    // continuing after the highest legacy number, never colliding with it.
    const newZoneResolution = resolutions.get("gula-darah-terkendali");
    expect(newZoneResolution?.isNew).toBe(true);
    expect(newZoneResolution?.zoneCode).toBe("khb-z10");
  });

  it("menetapkan zone_code khb-z01..khb-z09 secara deterministik walau database kosong", () => {
    const zones = [zone("Zona Imunitas Kuat", 1), zone("Zona Baru", 2)];
    const resolutions = resolveZones(zones, []);

    expect(resolutions.get("imunitas-kuat")).toMatchObject({
      isNew: true,
      matchMethod: "legacy",
      zoneCode: "khb-z01",
    });
    // The new zone must never collide with any legacy code (01-09), even
    // though none of the legacy zones exist in the database yet.
    expect(resolutions.get("baru")?.zoneCode).toBe("khb-z10");
  });

  it("menetapkan 11 zona baru pada khb-z10 sampai khb-z20 berurutan sesuai posisi dokumen", () => {
    const newZoneTitles = [
      "Zona Gula Darah Terkendali",
      "Zona Pernapasan Lega",
      "Zona Otak Cerdas",
      "Zona Anak Ceria",
      "Zona Kulit Cantik",
      "Zona Detoks dan Antioksidan",
      "Zona Antiinflamasi dan Nyeri",
      "Zona Antikanker (Potensial)",
      "Zona Obesitas dan Metabolik",
      "Zona Tidur dan Relaksasi",
      "Zona Kesehatan Mata",
    ];
    const zones = newZoneTitles.map((title, index) => zone(title, index + 6));
    const existingZones: HealthZoneRow[] = [
      healthZoneRow("khb-z01", "Zona Imunitas Kuat"),
      healthZoneRow("khb-z02", "Zona Pencernaan Sehat"),
      healthZoneRow("khb-z03", "Zona Ginjal Sehat"),
      healthZoneRow("khb-z04", "Zona Hati Sehat"),
      healthZoneRow("khb-z05", "Zona Jantung Sehat"),
      healthZoneRow("khb-z06", "Zona Tulang & Sendi"),
      healthZoneRow("khb-z07", "Zona Kesehatan Mulut"),
      healthZoneRow("khb-z08", "Zona Anti Mikroba"),
      healthZoneRow("khb-z09", "Zona Kesehatan Perempuan"),
    ];

    const resolutions = resolveZones(zones, existingZones);
    const codes = zones.map((z) => resolutions.get(z.slug)?.zoneCode);

    expect(codes).toEqual([
      "khb-z10",
      "khb-z11",
      "khb-z12",
      "khb-z13",
      "khb-z14",
      "khb-z15",
      "khb-z16",
      "khb-z17",
      "khb-z18",
      "khb-z19",
      "khb-z20",
    ]);
  });

  it("mencocokkan zona non-legacy yang sudah ada lewat judul ternormalisasi", () => {
    const zones = [zone("Zona Kesehatan Mata", 20)];
    const existingZones: HealthZoneRow[] = [
      healthZoneRow("khb-z15", "Zona Kesehatan Mata", "kesehatan-mata"),
    ];

    const resolutions = resolveZones(zones, existingZones);

    expect(resolutions.get("kesehatan-mata")).toMatchObject({
      isNew: false,
      matchMethod: "title",
      zoneCode: "khb-z15",
    });
  });

  it("tidak pernah menyerahkan kode zona legacy (khb-z01..09) ke judul lain lewat title-match", () => {
    // Regression: a differently-seeded/demo health_zones row can coincidentally
    // have BOTH a title that matches a new document zone AND a zone_code that
    // falls in the legacy-reserved range for a completely different title
    // (e.g. local seed data uses khb-z03 for "Zona Gula Darah Terkendali",
    // while khb-z03 is permanently reserved for "Zona Ginjal Sehat"). The
    // title match must be rejected in that case, never silently colliding.
    const zones = [
      zone("Zona Ginjal Sehat", 3),
      zone("Zona Gula Darah Terkendali", 6),
    ];
    const existingZones: HealthZoneRow[] = [
      // No legacy-titled row for "Zona Ginjal Sehat" exists yet in this
      // (fresh) database, but a demo/seed row happens to use khb-z03 for an
      // unrelated title that matches the new document zone by name.
      healthZoneRow("khb-z03", "Zona Gula Darah Terkendali", "glycemia"),
    ];

    const resolutions = resolveZones(zones, existingZones);

    expect(resolutions.get("ginjal-sehat")?.zoneCode).toBe("khb-z03");
    expect(resolutions.get("ginjal-sehat")?.matchMethod).toBe("legacy");
    const gulaDarah = resolutions.get("gula-darah-terkendali");
    expect(gulaDarah?.zoneCode).not.toBe("khb-z03");
    expect(gulaDarah?.isNew).toBe(true);

    const codes = Array.from(resolutions.values()).map((r) => r.zoneCode);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

function entry(zoneSlug: string, zoneTitle: string, rawZoneCode: string): HerbaCodeEntry {
  return {
    activeCompounds: [],
    benefits: [],
    cultivationTechniques: [],
    entryKey: `${zoneSlug}:plant`,
    entryOrder: 1,
    localName: "Plant",
    plantKey: "plant",
    plantSlug: "plant",
    preparationMethods: [],
    rawEntryTitle: "Plant",
    rawZoneTitle: zoneTitle,
    scientificName: null,
    titleCorrection: null,
    usedParts: [],
    warnings: [],
    zoneCode: rawZoneCode,
    zoneSlug,
    zoneTitle,
  };
}

describe("applyResolvedZoneCodes", () => {
  it("mengganti kode zona mentah (posisi dokumen) dengan kode permanen hasil resolusi, bukan placeholder", () => {
    // Regression: data/herbacode/herbacode-data.json is a live public fallback
    // (src/lib/data/herbacode.ts uses it whenever Supabase is unreachable,
    // including for the legacy /z/[code] QR redirect). If it kept the raw
    // occurrence-based zoneCode extract.ts assigns internally, a zone whose
    // document position differs from its permanent code (as happens for 4 of
    // the 9 legacy zones in this document) would redirect an old printed QR
    // code to the WRONG zone whenever the fallback path is used.
    const tulangSendi = zone("Zona Tulang & Sendi", 11, "tulang-dan-sendi");
    const gulaDarah = zone("Zona Gula Darah Terkendali", 6, "gula-darah-terkendali");
    const data: HerbaCodeData = {
      corrections: [],
      documentPath: "test.docx",
      documentSha256: null,
      entries: [
        entry("tulang-dan-sendi", "Zona Tulang & Sendi", tulangSendi.zoneCode),
        entry("gula-darah-terkendali", "Zona Gula Darah Terkendali", gulaDarah.zoneCode),
      ],
      sourceCode: "TEST",
      sourceTitle: "Test",
      uniquePlants: [],
      zones: [tulangSendi, gulaDarah],
    };
    const existingZones: HealthZoneRow[] = [
      healthZoneRow("khb-z06", "Zona Tulang & Sendi", "tulang-dan-sendi"),
    ];
    const zoneResolutions = resolveZones(data.zones, existingZones);

    const patched = applyResolvedZoneCodes(data, zoneResolutions);

    expect(patched.zones.find((z) => z.slug === "tulang-dan-sendi")?.zoneCode).toBe(
      "khb-z06",
    );
    expect(
      patched.entries.find((e) => e.zoneSlug === "tulang-dan-sendi")?.zoneCode,
    ).toBe("khb-z06");
    expect(patched.zones.find((z) => z.slug === "gula-darah-terkendali")?.zoneCode).toBe(
      "khb-z10",
    );
    expect(
      patched.entries.find((e) => e.zoneSlug === "gula-darah-terkendali")?.zoneCode,
    ).toBe("khb-z10");
  });
});

function plantRow(overrides: Partial<PlantRow>): PlantRow {
  return {
    canonical_local_name: overrides.local_name ?? "Plant",
    category: "daun",
    featured: false,
    id: "plant-id",
    identification_status: "candidate",
    image_path: null,
    local_name: "Plant",
    other_names: [],
    plant_code: "plant-code",
    scientific_name: null,
    slug: "plant",
    ...overrides,
  };
}

function herbaCodePlant(localName: string, scientificName: string | null): HerbaCodePlant {
  return {
    aliases: [],
    localName,
    plantKey: localName.toLowerCase().replace(/\s+/g, "-"),
    scientificName,
    slug: localName.toLowerCase().replace(/\s+/g, "-"),
  };
}

describe("findExistingPlantMatch: known local-name alias overrides", () => {
  it("mencocokkan 'Jinten Hitam' dari dokumen ke tanaman kanonis 'Jintan Hitam' walau other_names belum memuatnya", () => {
    // Regression for the production consolidation on 2026-07-31: even if the
    // merged alias were ever missing from other_names, the document's
    // "Jinten Hitam" wording must still resolve deterministically to the one
    // canonical plant, never re-creating a second ambiguous row.
    const canonical = plantRow({
      id: "canon-jintan-hitam",
      local_name: "Jintan Hitam",
      other_names: ["Habbatussauda"], // deliberately NOT including "Jinten Hitam"
      scientific_name: "Nigella sativa L.",
      slug: "jintan-hitam",
    });
    const indexes = buildExistingPlantIndexes([canonical], []);

    const match = findExistingPlantMatch(herbaCodePlant("Jinten Hitam", "Nigella sativa"), indexes);

    expect(match?.plantId).toBe("canon-jintan-hitam");
  });

  it("tidak menerapkan override apa pun ke pasangan Kunyit Putih / Temu Putih", () => {
    const kunyitPutih = plantRow({
      id: "id-kunyit-putih",
      local_name: "Kunyit Putih",
      scientific_name: "Curcuma zedoaria (Christm.) Roscoe.",
      slug: "kunyit-putih",
    });
    const indexes = buildExistingPlantIndexes([kunyitPutih], []);

    const match = findExistingPlantMatch(
      herbaCodePlant("Temu Putih", "Curcuma zedoaria (Christm.) Roscoe"),
      indexes,
    );

    // No local-name override exists for this pair, so "Temu Putih" must NOT
    // resolve to the "Kunyit Putih" row via the override path. (It may still
    // resolve via the separate scientific-name fallback if the document
    // provides one -- which is what keeps them linked-but-flagged, not
    // silently merged.)
    expect(match?.method).not.toBe("alias");
  });
});

function plan(
  localName: string,
  scientificName: string | null,
  existingMatch: ImportPlanPlant["existingMatch"],
): ImportPlanPlant {
  const plantKey = localName.toLowerCase().replace(/\s+/g, "-");

  return {
    entries: [],
    existingMatch,
    plant: {
      aliases: [],
      localName,
      plantKey,
      scientificName,
      slug: plantKey,
    },
  };
}

describe("buildAmbiguousScientificNameGroups", () => {
  it("menandai Kunyit Putih dan Temu Putih sebagai ambiguous tanpa menggabungkannya", () => {
    const plans = [
      plan("Kunyit Putih", "Curcuma zedoaria (Christm.) Roscoe.", {
        matchKey: "Kunyit Putih",
        method: "exact",
        plantId: "plant-kunyit-putih",
      }),
      plan("Temu Putih", "Curcuma zedoaria (Christm.) Roscoe", {
        matchKey: "Temu Putih",
        method: "exact",
        plantId: "plant-temu-putih",
      }),
    ];

    const ambiguous = buildAmbiguousScientificNameGroups(plans);

    expect(ambiguous).toHaveLength(1);
    expect(ambiguous[0]?.localNames.sort()).toEqual(["Kunyit Putih", "Temu Putih"]);
  });

  it("tidak menandai Katuk dan Daun Katuk sebagai ambiguous ketika keduanya cocok ke tanaman existing yang sama", () => {
    const plans = [
      plan("Katuk", "Sauropus androgynus (L.) Merr.", {
        matchKey: "Katuk",
        method: "exact",
        plantId: "plant-katuk",
      }),
      plan("Daun Katuk", "Sauropus androgynus (L.) Merr.", {
        matchKey: "Sauropus androgynus (L.) Merr.",
        method: "scientific",
        plantId: "plant-katuk",
      }),
    ];

    const ambiguous = buildAmbiguousScientificNameGroups(plans);

    expect(ambiguous).toHaveLength(0);
  });

  it("mengabaikan tanaman tanpa nama ilmiah", () => {
    const plans = [plan("Tanpa Nama Ilmiah", null, null)];

    expect(buildAmbiguousScientificNameGroups(plans)).toHaveLength(0);
  });

  it("menandai tanaman baru yang berbagi nama ilmiah dengan tanaman existing berbeda", () => {
    const plans = [
      plan("Rosella", "Hibiscus sabdariffa L.", {
        matchKey: "Rosella",
        method: "exact",
        plantId: "plant-rosella",
      }),
      plan("Rosela", "Hibiscus sabdariffa L.", null),
    ];

    const ambiguous = buildAmbiguousScientificNameGroups(plans);

    expect(ambiguous).toHaveLength(1);
    expect(ambiguous[0]?.localNames.sort()).toEqual(["Rosela", "Rosella"]);
  });

  it("tidak menandai tanaman berbeda sebagai ambiguous hanya karena nama ilmiah sama-sama tidak lengkap", () => {
    // Real source-document gap: a few entries only have a bare taxonomic
    // authority abbreviation ("L.") instead of a full genus + species. These
    // are three unrelated species (rosela/saffron/goji berry), not evidence
    // of overlapping identity, so they must never be grouped together.
    const plans = [
      plan("Rosela", "L.", null),
      plan("Safron", "L.", null),
      plan("Goji Berry", "L.", null),
    ];

    expect(buildAmbiguousScientificNameGroups(plans)).toHaveLength(0);
  });
});
