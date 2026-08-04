import { Suspense } from "react";
import type { Metadata } from "next";
import { PosterPlantCatalog } from "@/components/plants/PosterPlantCatalog";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { PageHero } from "@/components/ui/PageHero";
import {
  buildUnifiedPlantCatalog,
  filterAndSortPlantCatalog,
} from "@/lib/plant-catalog-filter";
import { getPosterPlantCatalog } from "@/lib/data/poster-plants";
import { getHerbaCodePlantCatalog } from "@/lib/data/herbacode";
import { createPageMetadata } from "@/lib/metadata";

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
    <PageHero
      className="py-6 sm:py-7 lg:py-8"
      eyebrow="Katalog Tanaman"
      title="Tanaman Kampung Herbal Harmony"
    >
      <Suspense
        fallback={
          <p className="text-sm text-herbal-muted">Memuat katalog tanaman.</p>
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
      <div className="mt-6 sm:mt-8">
        <Disclaimer>
          Informasi tanaman pada website ini disediakan untuk edukasi mengenai
          pemanfaatan tradisional. Informasi ini bukan diagnosis, resep, atau
          pengganti konsultasi dengan dokter, apoteker, maupun tenaga
          kesehatan lainnya.
        </Disclaimer>
      </div>
    </PageHero>
  );
}

