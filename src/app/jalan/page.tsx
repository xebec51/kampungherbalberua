import type { Metadata } from "next";
import { Suspense } from "react";
import { StreetCatalog } from "@/components/streets/StreetCatalog";
import { Container } from "@/components/ui/Container";
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
    <section className="brand-pattern border-b border-herbal-green/10 bg-herbal-cream py-6 text-herbal-ink sm:py-7 lg:py-8">
      <Container>
        <Suspense
          fallback={
            <p className="text-sm text-herbal-muted">
              Memuat katalog jalan tematik.
            </p>
          }
        >
          <StreetCatalog
            eyebrow="Jelajahi"
            streets={streets}
            title="Jalan Tematik Kampung Herbal"
          />
        </Suspense>
      </Container>
    </section>
  );
}
