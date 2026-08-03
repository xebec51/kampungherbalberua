import type { PosterPlantCatalogItem, PublicImageKind } from "@/types";

export const plantCatalogSortOptions = [
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
  { label: "Paling sering muncul", value: "frekuensi" },
  { label: "Paling banyak zona", value: "zona" },
  { label: "Gambar paling spesifik", value: "spesifik" },
  { label: "Urutan katalog Harmony", value: "poster" },
] as const;

export type PlantCatalogSort = (typeof plantCatalogSortOptions)[number]["value"];

const allowedSorts = new Set<string>(
  plantCatalogSortOptions.map((option) => option.value),
);

export function resolvePlantCatalogSort(value: string): PlantCatalogSort {
  return allowedSorts.has(value) ? (value as PlantCatalogSort) : "az";
}

export type PlantCatalogFilterParams = {
  q: string;
  zona: string;
  bagian: string;
  gambar: string;
  urut: string;
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function firstPosterNumber(plant: PosterPlantCatalogItem) {
  return Math.min(...plant.posterNumbers, Number.POSITIVE_INFINITY);
}

export function filterAndSortPlantCatalog(
  plants: PosterPlantCatalogItem[],
  params: PlantCatalogFilterParams,
) {
  const normalizedQuery = normalize(params.q);
  const sort = resolvePlantCatalogSort(params.urut);
  const imageKindScore: Record<PublicImageKind, number> = {
    generic: 0,
    reference: 1,
    specific: 2,
  };

  return plants
    .filter((plant) => {
      const matchesCollection =
        !params.zona || plant.collections.includes(params.zona);
      const matchesPart = !params.bagian || plant.partCategory === params.bagian;
      const matchesImageKind =
        !params.gambar || plant.imageKind === params.gambar;
      const searchableText = [
        plant.rawName,
        plant.normalizedName,
        plant.localName,
        plant.scientificName ?? "",
        plant.partCategory,
        ...plant.collections,
        ...plant.searchAliases,
        String(plant.posterNumbers.join(" ")),
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCollection &&
        matchesPart &&
        matchesImageKind &&
        searchableText.includes(normalizedQuery)
      );
    })
    .sort((a, b) => {
      if (sort === "za") return b.rawName.localeCompare(a.rawName, "id");
      if (sort === "frekuensi") {
        return b.posterOccurrenceCount - a.posterOccurrenceCount;
      }
      if (sort === "zona") {
        return b.collections.length - a.collections.length;
      }
      if (sort === "spesifik") {
        return imageKindScore[b.imageKind] - imageKindScore[a.imageKind];
      }
      if (sort === "poster") {
        return (
          firstPosterNumber(a) - firstPosterNumber(b) ||
          a.rawName.localeCompare(b.rawName, "id")
        );
      }
      return a.rawName.localeCompare(b.rawName, "id");
    });
}
