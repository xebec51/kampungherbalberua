import { normalizePosterName } from "@/lib/data/poster-plants";
import type {
  HerbaCodePlantProfile,
  PosterPlantCatalogItem,
  PublicImageKind,
} from "@/types";

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

const manualHerbaToPosterNames = new Map([
  ["jintan hitam", ["jinten hitam"]],
  ["katuk", ["daun katuk"]],
  ["salam", ["daun salam"]],
]);

/**
 * Merges the poster catalog and the HerbaCode catalog into one deduplicated
 * plant list -- the canonical "how many unique plants does the site have"
 * count. Shared so every place that needs that total (the /tanaman catalog
 * page, the homepage HerbaCode stats) computes it the same way and the
 * numbers can never drift apart.
 */
export function buildUnifiedPlantCatalog(
  posterPlants: PosterPlantCatalogItem[],
  herbaCodePlants: HerbaCodePlantProfile[],
) {
  const herbaByPosterName = new Map<string, HerbaCodePlantProfile>();
  const matchedHerbaPlantIds = new Set<string>();

  for (const plant of herbaCodePlants) {
    const candidates = [
      plant.localName,
      ...plant.aliases,
      ...(manualHerbaToPosterNames.get(normalizePosterName(plant.localName)) ??
        []),
    ]
      .map(normalizePosterName)
      .filter(Boolean);

    for (const candidate of candidates) {
      if (!herbaByPosterName.has(candidate)) {
        herbaByPosterName.set(candidate, plant);
      }
    }
  }

  const mergedPosterPlants = posterPlants.map((posterPlant) => {
    const herbaPlant = herbaByPosterName.get(posterPlant.normalizedName);

    if (!herbaPlant) {
      return posterPlant;
    }

    matchedHerbaPlantIds.add(herbaPlant.id);

    return {
      ...posterPlant,
      collections: Array.from(
        new Set([
          ...posterPlant.collections,
          ...herbaPlant.zoneEntries.map((entry) => entry.zoneTitle),
        ]),
      ).sort((left, right) => left.localeCompare(right, "id")),
      image: posterPlant.image ?? herbaPlant.image,
      linkedPlantId: herbaPlant.id,
      linkedPlantSlug: herbaPlant.slug,
      localName: herbaPlant.localName,
      scientificName: herbaPlant.scientificName ?? posterPlant.scientificName,
      searchAliases: Array.from(
        new Set([...posterPlant.searchAliases, ...herbaPlant.aliases]),
      ),
    } satisfies PosterPlantCatalogItem;
  });

  const herbaOnlyPlants = herbaCodePlants
    .filter((plant) => !matchedHerbaPlantIds.has(plant.id))
    .map(
      (plant) =>
        ({
          attributionText: null,
          category: null,
          changesMade: null,
          collections: Array.from(
            new Set(plant.zoneEntries.map((entry) => entry.zoneTitle)),
          ),
          creatorName: null,
          description: "Data tanaman bersumber dari HerbaCode Kampung Herbal Harmony.",
          id: `herbacode-${plant.id}`,
          image: plant.image,
          imageDuplicateStatus: null,
          imageIsIllustration: false,
          imageKind: plant.image ? "specific" : "generic",
          imageRelevanceStatus: plant.image ? "exact" : "generic_fallback",
          licenseCode: null,
          licenseUrl: null,
          linkedPlantId: plant.id,
          linkedPlantSlug: plant.slug,
          localName: plant.localName,
          normalizedName: normalizePosterName(plant.localName),
          partCategory: "Tidak diklasifikasikan",
          posterNumbers: [],
          posterOccurrenceCount: 0,
          rawName: plant.localName,
          searchAliases: plant.aliases,
          scientificName: plant.scientificName,
          slug: plant.slug,
          sourceLabel: "HerbaCode Kampung Herbal Harmony",
          sourcePageUrl: null,
        }) satisfies PosterPlantCatalogItem,
    );

  return dedupeCanonicalPlants([...mergedPosterPlants, ...herbaOnlyPlants]).sort(
    (left, right) => left.rawName.localeCompare(right.rawName, "id"),
  );
}

function dedupeCanonicalPlants(plants: PosterPlantCatalogItem[]) {
  const byCanonicalKey = new Map<string, PosterPlantCatalogItem>();

  for (const plant of plants) {
    const key = plant.linkedPlantSlug ?? plant.normalizedName;
    const existing = byCanonicalKey.get(key);

    if (!existing) {
      byCanonicalKey.set(key, plant);
      continue;
    }

    const preferred =
      plant.linkedPlantSlug && plant.localName === plant.rawName ? plant : existing;
    const secondary = preferred === plant ? existing : plant;

    byCanonicalKey.set(key, {
      ...preferred,
      collections: Array.from(
        new Set([...preferred.collections, ...secondary.collections]),
      ).sort((left, right) => left.localeCompare(right, "id")),
      posterNumbers: Array.from(
        new Set([...preferred.posterNumbers, ...secondary.posterNumbers]),
      ).sort((left, right) => left - right),
      posterOccurrenceCount:
        preferred.posterOccurrenceCount + secondary.posterOccurrenceCount,
      searchAliases: Array.from(
        new Set([
          ...preferred.searchAliases,
          ...secondary.searchAliases,
          secondary.rawName,
        ]),
      ),
    });
  }

  return Array.from(byCanonicalKey.values());
}
