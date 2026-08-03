import { Suspense } from "react";
import type { Metadata } from "next";
import { PosterPlantCatalog } from "@/components/plants/PosterPlantCatalog";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { PageHero } from "@/components/ui/PageHero";
import { filterAndSortPlantCatalog } from "@/lib/plant-catalog-filter";
import {
  getPosterPlantCatalog,
  normalizePosterName,
} from "@/lib/data/poster-plants";
import { getHerbaCodePlantCatalog } from "@/lib/data/herbacode";
import { createPageMetadata } from "@/lib/metadata";
import type { HerbaCodePlantProfile, PosterPlantCatalogItem } from "@/types";

export const revalidate = 300;

const PLANT_PAGE_SIZE = 24;

export const metadata: Metadata = createPageMetadata({
  title: "Katalog Tanaman Kampung Herbal Harmony",
  description:
    "Katalog tanaman Kampung Herbal Harmony untuk mengenal tanaman, zona edukasi, dan konteks wilayah RT 009/RW 006 Kelurahan Berua.",
  path: "/tanaman",
});

type PlantsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function PlantsPage({ searchParams }: PlantsPageProps) {
  const params = await searchParams;
  const [herbaCodePlants, posterPlants] = await Promise.all([
    getHerbaCodePlantCatalog(),
    getPosterPlantCatalog(),
  ]);
  const plants = buildUnifiedPlantCatalog(posterPlants, herbaCodePlants);

  const collections = Array.from(
    new Set(plants.flatMap((plant) => plant.collections)),
  ).sort((a, b) => a.localeCompare(b, "id"));
  const parts = Array.from(
    new Set(plants.map((plant) => plant.partCategory)),
  ).sort((a, b) => a.localeCompare(b, "id"));

  const filterParams = {
    q: firstParam(params.q),
    zona: firstParam(params.zona),
    bagian: firstParam(params.bagian),
    gambar: firstParam(params.gambar),
    urut: firstParam(params.urut),
  };
  const filteredPlants = filterAndSortPlantCatalog(plants, filterParams);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlants.length / PLANT_PAGE_SIZE),
  );
  const requestedPage = Number.parseInt(firstParam(params.halaman), 10);
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageItems = filteredPlants.slice(
    (currentPage - 1) * PLANT_PAGE_SIZE,
    currentPage * PLANT_PAGE_SIZE,
  );

  return (
    <>
      <PageHero
        description="Katalog gabungan dari poster Kampung Herbal dan HerbaCode. Tanaman yang sudah memiliki profil edukasi menampilkan zona, senyawa aktif, bagian tanaman, budidaya, perhatian, dan pemanfaatan tradisional sesuai sumber."
        eyebrow="Katalog Tanaman"
        title="Katalog Tanaman Kampung Herbal Harmony"
      />
      <section className="bg-herbal-cream py-10 sm:py-12">
        <Container>
          <Suspense
            fallback={
              <p className="mt-8 text-sm text-herbal-muted">
                Memuat katalog tanaman.
              </p>
            }
          >
            <PosterPlantCatalog
              collections={collections}
              currentPage={currentPage}
              filteredCount={filteredPlants.length}
              items={pageItems}
              parts={parts}
              totalCount={plants.length}
              totalPages={totalPages}
            />
          </Suspense>
          <div className="mt-8">
            <Disclaimer>
              Informasi tanaman pada website ini disediakan untuk edukasi
              mengenai pemanfaatan tradisional. Informasi ini bukan diagnosis,
              resep, atau pengganti konsultasi dengan dokter, apoteker, maupun
              tenaga kesehatan lainnya.
            </Disclaimer>
          </div>
        </Container>
      </section>
    </>
  );
}

const manualHerbaToPosterNames = new Map([
  ["jintan hitam", ["jinten hitam"]],
  ["katuk", ["daun katuk"]],
  ["salam", ["daun salam"]],
]);

function buildUnifiedPlantCatalog(
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

  return dedupeCanonicalPlants([...mergedPosterPlants, ...herbaOnlyPlants]).sort((left, right) =>
    left.rawName.localeCompare(right.rawName, "id"),
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
