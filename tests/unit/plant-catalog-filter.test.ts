import { describe, expect, it } from "vitest";
import type { PosterPlantCatalogItem } from "@/types";
import { filterAndSortPlantCatalog } from "@/lib/plant-catalog-filter";

function plant(
  rawName: string,
  overrides: Partial<PosterPlantCatalogItem> = {},
): PosterPlantCatalogItem {
  const normalizedName = rawName.toLowerCase().replaceAll(" ", "-");

  return {
    attributionText: null,
    category: null,
    changesMade: null,
    collections: ["Zona Jantung Sehat"],
    creatorName: null,
    description: "",
    id: normalizedName,
    image: null,
    imageDuplicateStatus: null,
    imageIsIllustration: false,
    imageKind: "specific",
    imageRelevanceStatus: "exact",
    licenseCode: null,
    licenseUrl: null,
    linkedPlantId: null,
    linkedPlantSlug: null,
    localName: rawName,
    normalizedName,
    partCategory: "Daun",
    posterNumbers: [10],
    posterOccurrenceCount: 1,
    rawName,
    searchAliases: [],
    scientificName: null,
    slug: normalizedName,
    sourceLabel: "Test",
    sourcePageUrl: null,
    ...overrides,
  };
}

describe("filterAndSortPlantCatalog", () => {
  it("mengurutkan berdasarkan nomor poster pertama untuk urutan katalog Harmony", () => {
    const result = filterAndSortPlantCatalog(
      [
        plant("Belimbing", { posterNumbers: [12] }),
        plant("Adas", { posterNumbers: [2, 7] }),
        plant("Cincau", { posterNumbers: [] }),
      ],
      { bagian: "", gambar: "", q: "", urut: "poster", zona: "" },
    );

    expect(result.map((item) => item.rawName)).toEqual([
      "Adas",
      "Belimbing",
      "Cincau",
    ]);
  });

  it("memfilter query, zona, bagian, dan jenis gambar sebelum paginasi server", () => {
    const result = filterAndSortPlantCatalog(
      [
        plant("Jahe", {
          collections: ["Zona Pencernaan Sehat"],
          imageKind: "specific",
          partCategory: "Rimpang",
          searchAliases: ["zingiber"],
        }),
        plant("Seledri", {
          collections: ["Zona Jantung Sehat"],
          imageKind: "reference",
          partCategory: "Daun",
        }),
      ],
      {
        bagian: "Rimpang",
        gambar: "specific",
        q: "zingiber",
        urut: "az",
        zona: "Zona Pencernaan Sehat",
      },
    );

    expect(result.map((item) => item.rawName)).toEqual(["Jahe"]);
  });
});
