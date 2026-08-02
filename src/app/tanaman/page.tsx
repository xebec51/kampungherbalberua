import { Suspense } from "react";
import type { Metadata } from "next";
import { PosterPlantCatalog } from "@/components/plants/PosterPlantCatalog";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { PageHero } from "@/components/ui/PageHero";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import {
  POSTER_CLAIMED_ENTRY_COUNT,
  getPosterPlantCatalog,
  normalizePosterName,
} from "@/lib/data/poster-plants";
import {
  getHerbaCodePlantCatalog,
  getHerbaCodeZoneSummaries,
} from "@/lib/data/herbacode";
import { createPageMetadata } from "@/lib/metadata";
import type { HerbaCodePlantProfile, PosterPlantCatalogItem } from "@/types";

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: "Katalog Tanaman Kampung Herbal Harmony",
  description:
    "Katalog tanaman Kampung Herbal Harmony untuk mengenal tanaman, zona edukasi, dan konteks wilayah RT 009/RW 006 Kelurahan Berua.",
  path: "/tanaman",
});

export default async function PlantsPage() {
  const [herbaCodePlants, posterPlants, zones] = await Promise.all([
    getHerbaCodePlantCatalog(),
    getPosterPlantCatalog(),
    getHerbaCodeZoneSummaries(),
  ]);
  const plants = buildUnifiedPlantCatalog(posterPlants, herbaCodePlants);
  const entryCount = herbaCodePlants.reduce(
    (total, plant) => total + plant.zoneEntries.length,
    0,
  );
  const posterOccurrenceCount = posterPlants.reduce(
    (total, plant) => total + plant.posterOccurrenceCount,
    0,
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
        <StaggerGroup className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <StaggerItem>
            <CatalogMetric
              label="Katalog final"
              value={String(plants.length)}
              description="Union poster dan HerbaCode setelah deduplikasi nama."
            />
          </StaggerItem>
          <StaggerItem>
            <CatalogMetric
              label="Nama poster"
              value={String(posterPlants.length)}
              description="Nama tanaman dari katalog poster."
            />
          </StaggerItem>
          <StaggerItem>
            <CatalogMetric
              label="Nomor poster lama"
              value={`${posterOccurrenceCount}/${POSTER_CLAIMED_ENTRY_COUNT}`}
              description="Entri terbaca dari sumber poster 216 tanaman."
            />
          </StaggerItem>
          <StaggerItem>
            <CatalogMetric
              label="Tanaman HerbaCode"
              value={String(herbaCodePlants.length)}
              description="Tanaman unik yang memiliki detail HerbaCode."
            />
          </StaggerItem>
          <StaggerItem>
            <CatalogMetric
              label="Zona HerbaCode"
              value={String(zones.length)}
              description="Zona kesehatan yang terbaca dari dokumen sumber."
            />
          </StaggerItem>
          <StaggerItem>
            <CatalogMetric
              label="Relasi tanaman-zona"
              value={String(entryCount)}
              description="Setiap relasi menyimpan manfaat sesuai zona."
            />
          </StaggerItem>
        </StaggerGroup>
        <Suspense fallback={<p className="mt-8 text-sm text-herbal-muted">Memuat katalog tanaman.</p>}>
          <PosterPlantCatalog
            claimedPosterEntryCount={POSTER_CLAIMED_ENTRY_COUNT}
            plants={plants}
          />
        </Suspense>
        <div className="mt-8">
          <Disclaimer>
            Informasi tanaman pada website ini disediakan untuk edukasi mengenai
            pemanfaatan tradisional. Informasi ini bukan diagnosis, resep, atau
            pengganti konsultasi dengan dokter, apoteker, maupun tenaga kesehatan
            lainnya.
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

function CatalogMetric({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-3 shadow-[var(--shadow-soft)] sm:p-4">
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-herbal-muted">
        {label}
      </dt>
      <dd className="mt-2 text-xl font-extrabold text-herbal-deep sm:text-2xl">
        {value}
      </dd>
      <p className="mt-2 text-[0.72rem] leading-5 text-herbal-muted sm:text-xs">
        {description}
      </p>
    </div>
  );
}
