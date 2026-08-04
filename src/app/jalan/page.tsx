import type { Metadata } from "next";
import { Suspense } from "react";
import { StreetCatalog } from "@/components/streets/StreetCatalog";
import { PageHero } from "@/components/ui/PageHero";
import { getPublishedStreets } from "@/lib/data/streets";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: "Jalan Tematik Kampung Herbal",
  description:
    "Daftar jalan tematik Kampung Herbal Harmony berdasarkan foto dokumentasi papan jalan.",
  path: "/jalan",
});

export default async function StreetsPage() {
  const streets = await getPublishedStreets();

  return (
    <PageHero
      className="py-6 sm:py-7 lg:py-8"
      eyebrow="Jelajahi"
      title="Jalan Tematik Kampung Herbal"
    >
      <Suspense
        fallback={
          <p className="text-sm text-herbal-muted">
            Memuat katalog jalan tematik.
          </p>
        }
      >
        <StreetCatalog streets={streets} />
      </Suspense>
    </PageHero>
  );
}
