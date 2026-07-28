import { describe, expect, it } from "vitest";
import {
  buildAttributionText,
  chooseLicense,
  stripHtml,
} from "../../scripts/media/lib/license";
import { readFileSync } from "node:fs";
import {
  detectImageMime,
  sha256,
  storageKey,
} from "../../scripts/media/lib/media-files";
import {
  buildUnresolvedPlantReport,
  INITIAL_PLANT_DESCRIPTION,
  isAmbiguousPosterName,
} from "../../scripts/media/lib/plant-taxonomy";
import {
  normalizePlantName,
  validatePosterWorkbook,
} from "../../scripts/media/lib/poster";
import { scorePlantCandidate } from "../../scripts/media/lib/research";
import {
  AMBIGUOUS_POSTER_NAMES,
  PLANT_TAXONOMY_MAPPINGS,
} from "../../data/plant-taxonomy/mappings";
import type { WikimediaCandidate } from "../../scripts/media/lib/wikimedia";

describe("media license governance", () => {
  it("menerima lisensi whitelist", () => {
    const decision = chooseLicense(
      "Creative Commons Attribution-Share Alike 4.0",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/",
    );

    expect(decision.status).toBe("approved");
    expect(decision.code).toBe("CC BY-SA 4.0");
  });

  it("menolak lisensi non-commercial", () => {
    const decision = chooseLicense("CC BY-NC-SA 4.0", "", null);

    expect(decision.status).toBe("rejected");
  });

  it("menolak media eksternal tanpa lisensi", () => {
    const decision = chooseLicense("", "", null);

    expect(decision.status).toBe("rejected");
  });

  it("membersihkan metadata HTML menjadi plain text", () => {
    expect(stripHtml("<b>Nama</b>&nbsp;Kreator &amp; Tim")).toBe(
      "Nama Kreator & Tim",
    );
  });

  it("membuat atribusi tanpa memasukkan HTML", () => {
    expect(
      buildAttributionText({
        creatorName: "Kreator",
        licenseCode: "CC BY 4.0",
        sourcePageUrl: "https://commons.wikimedia.org/wiki/File:test.jpg",
        title: "Foto Jahe",
      }),
    ).toContain("Foto Jahe oleh Kreator");
  });
});

describe("media file safeguards", () => {
  it("mendeteksi magic bytes gambar", () => {
    expect(detectImageMime(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe(
      "image/jpeg",
    );
    expect(() => detectImageMime(Buffer.from("<html>"))).toThrow(
      /Magic bytes/,
    );
  });

  it("membuat checksum dan storage path stabil", () => {
    const checksum = sha256(Buffer.from("kampung herbal"));

    expect(checksum).toMatch(/^[0-9a-f]{64}$/);
    expect(
      storageKey({
        entityKey: "KHB Z01",
        hash: checksum,
        role: "cover",
        scope: "health-zones",
      }),
    ).toMatch(/^health-zones\/khb-z01\/cover-[0-9a-f]{12}\.webp$/);
  });

  it("menggunakan upload no-overwrite dan tidak memiliki operasi delete storage", () => {
    const source = readFileSync("scripts/media/lib/media-files.ts", "utf8");

    expect(source).toContain("upsert: false");
    expect(source).not.toContain(".remove(");
  });
});

describe("poster workbook validation", () => {
  it("memvalidasi jumlah zona, entri, nama unik, dan gap nomor", () => {
    const summary = validatePosterWorkbook();

    expect(summary.status).toBe("valid");
    expect(summary.zoneCount).toBe(20);
    expect(summary.entryCount).toBe(206);
    expect(summary.uniqueRawNameCount).toBe(89);
    expect(summary.gap157to166Absent).toBe(true);
    expect(summary.duplicatePosterNumbers).toEqual([]);
  });

  it("menormalisasi nama tanaman secara deterministik", () => {
    expect(normalizePlantName("  Daun   Sirih! ")).toBe("daun sirih");
  });
});

describe("plant image candidate scoring", () => {
  it("memberi skor tinggi untuk kandidat berlisensi dan exact match", () => {
    const candidate: WikimediaCandidate = {
      attributionText: "Atribusi",
      creatorName: "Kreator",
      description: "Whole plant Zingiber officinale",
      fileTitle: "File:Zingiber officinale plant.jpg",
      height: 1400,
      licenseCode: "CC BY 4.0",
      licenseReason: "whitelist",
      licenseStatus: "approved",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      mime: "image/jpeg",
      sha1: "abc",
      size: 1000,
      sourceFileUrl: "https://upload.wikimedia.org/test.jpg",
      sourcePageUrl: "https://commons.wikimedia.org/wiki/File:test.jpg",
      title: "Zingiber officinale",
      width: 1400,
    };

    expect(
      scorePlantCandidate(candidate, "Zingiber officinale").score,
    ).toBeGreaterThanOrEqual(90);
  });
});

describe("plant taxonomy workflow", () => {
  it("mempertahankan 85 item unresolved walau manifest approved kosong", () => {
    const collectionId = "collection-1";
    const entries = Array.from({ length: 85 }, (_, index) => ({
      collection_id: collectionId,
      mapping_status: "unresolved",
      normalized_candidate_name: `nama-${index + 1}`,
      plant_id: null,
      poster_number: index + 1,
      raw_plant_name: `Nama ${index + 1}`,
    }));

    const report = buildUnresolvedPlantReport(
      entries,
      new Map([[collectionId, "Zona Uji"]]),
      new Map(),
    );

    expect(report).toHaveLength(85);
    expect(report[0]).toMatchObject({
      mappingStatus: "unresolved",
      researchStatus: "pending_taxonomy_review",
    });
  });

  it("tidak memaksa nama ambigu menjadi mapping eligible", () => {
    const mappedRawNames = new Set(
      PLANT_TAXONOMY_MAPPINGS.flatMap((mapping) =>
        mapping.rawNames.map(normalizePlantName),
      ),
    );

    for (const rawName of AMBIGUOUS_POSTER_NAMES) {
      expect(isAmbiguousPosterName(rawName)).toBe(true);
      expect(mappedRawNames.has(normalizePlantName(rawName))).toBe(false);
    }
  });

  it("manifest approved memiliki atribusi dan tidak memberi image pada nama ambigu", () => {
    const manifest = JSON.parse(
      readFileSync("data/media/manifests/plant-images.json", "utf8"),
    ) as Array<{
      attribution: string | null;
      decision: string;
      license: string | null;
      localName: string;
      sourcePage: string | null;
    }>;
    const approved = manifest.filter((item) => item.decision === "approved");
    const ambiguousNames = new Set(
      AMBIGUOUS_POSTER_NAMES.map((name) => normalizePlantName(name)),
    );

    expect(approved.length).toBeGreaterThan(0);
    expect(
      approved.some((item) => normalizePlantName(item.localName) === "jahe"),
    ).toBe(true);

    for (const item of approved) {
      expect(item.attribution).toBeTruthy();
      expect(item.license).toBeTruthy();
      expect(item.sourcePage).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
      expect(ambiguousNames.has(normalizePlantName(item.localName))).toBe(false);
    }
  });

  it("summary image tidak menyatakan seluruh research selesai bila masih unresolved", () => {
    const summary = JSON.parse(
      readFileSync("data/media/reports/plant-image-summary.json", "utf8"),
    ) as { fullResearchCompleted: boolean; unresolved: number };

    expect(summary.unresolved).toBeGreaterThan(0);
    expect(summary.fullResearchCompleted).toBe(false);
  });

  it("deskripsi awal tanaman tidak menghasilkan klaim medis", () => {
    expect(INITIAL_PLANT_DESCRIPTION).toContain("proses verifikasi");
    expect(INITIAL_PLANT_DESCRIPTION).not.toMatch(
      /menyembuhkan|kanker|gula darah|detoks|dosis|obat dokter/i,
    );
  });
});
