import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  normalizePosterName,
  posterPlantSlug,
} from "../../src/lib/data/poster-plants";

type Summary = {
  catalogItems: number;
  catalogItemsWithImage: number;
  exactImages: number;
  genericFallbackImages: number;
  linkedPlants: number;
  posterOnlyItems: number;
  uniquePosterNames: number;
};

type PosterImageReportItem = {
  imageIsIllustration: boolean;
  imageSource: "plant_media" | "generic_wikimedia";
  licenseCode: string | null;
  rawName: string;
  sourcePageUrl: string | null;
};

type PosterCatalogManifestItem = {
  collections: string[];
  posterNumbers: number[];
  rawName: string;
  slug: string;
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

describe("public poster plant catalog", () => {
  it("menghasilkan 89 kartu unik dari 206 kemunculan poster", () => {
    const summary = readJson<Summary>(
      "data/media/reports/poster-plant-catalog-summary.json",
    );

    expect(summary.uniquePosterNames).toBe(89);
    expect(summary.catalogItems).toBe(89);
    expect(summary.linkedPlants + summary.posterOnlyItems).toBe(89);
  });

  it("seluruh item katalog mempunyai gambar", () => {
    const summary = readJson<Summary>(
      "data/media/reports/poster-plant-catalog-summary.json",
    );

    expect(summary.catalogItemsWithImage).toBe(89);
    expect(summary.exactImages + summary.genericFallbackImages).toBe(89);
  });

  it("slug poster stabil dan tidak bergantung pada slug plants", () => {
    expect(posterPlantSlug("Bawang Putih")).toBe("bawang-putih");
    expect(posterPlantSlug("Willow Bark")).toBe("willow-bark");
    expect(posterPlantSlug("Rosmary")).toBe("rosmary");
    expect(normalizePosterName("  Kunyit   Putih! ")).toBe("kunyit putih");
  });

  it("nama unresolved dan ambigu tetap muncul", () => {
    const report = readJson<PosterImageReportItem[]>(
      "data/media/reports/poster-plant-images.json",
    );
    const rawNames = new Set(report.map((item) => item.rawName));

    expect(rawNames.has("Cincau")).toBe(true);
    expect(rawNames.has("Garcinia")).toBe(true);
    expect(rawNames.has("Rosemary")).toBe(true);
    expect(rawNames.has("Merigold")).toBe(true);
    expect(rawNames.has("Willow Bark")).toBe(true);
  });

  it("manifest fallback publik memuat 89 nama dengan zona dan nomor poster", () => {
    const manifest = readJson<PosterCatalogManifestItem[]>(
      "data/media/manifests/poster-plant-catalog.json",
    );
    const rawNames = new Set(manifest.map((item) => item.rawName));

    expect(manifest).toHaveLength(89);
    expect(rawNames.has("Cincau")).toBe(true);
    expect(rawNames.has("Garcinia")).toBe(true);
    expect(rawNames.has("Rosemary")).toBe(true);
    expect(rawNames.has("Merigold")).toBe(true);
    expect(rawNames.has("Willow Bark")).toBe(true);

    for (const item of manifest) {
      expect(item.slug).toBeTruthy();
      expect(item.posterNumbers.length).toBeGreaterThan(0);
      expect(item.collections.length).toBeGreaterThan(0);
    }
  });

  it("ilustrasi poster mempunyai source dan license metadata", () => {
    const report = readJson<PosterImageReportItem[]>(
      "data/media/reports/poster-plant-images.json",
    );
    const illustrations = report.filter(
      (item) => item.imageSource === "generic_wikimedia",
    );

    expect(illustrations.length).toBeGreaterThan(0);

    for (const item of illustrations) {
      expect(item.imageIsIllustration).toBe(true);
      expect(item.sourcePageUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
      expect(item.licenseCode).toBeTruthy();
    }
  });

  it("data layer poster tidak memfilter status internal plants", () => {
    const source = readFileSync("src/lib/data/poster-plants.ts", "utf8");

    expect(source).not.toContain(".eq(\"content_status\"");
    expect(source).not.toContain(".eq(\"validation_status\"");
    expect(source).not.toContain(".eq(\"identification_status\"");
  });
});
