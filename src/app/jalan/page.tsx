import type { Metadata } from "next";
import { StreetCard } from "@/components/streets/StreetCard";
import { Container } from "@/components/ui/Container";
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
    <>
      <PageHero
        description="Jalan tematik adalah dokumentasi fisik wilayah. Daftar tanaman pada setiap jalan mengikuti entri HerbaCode yang telah dipublikasikan pada zona kesehatan pasangannya."
        eyebrow="Jalan Tematik"
        title="Jalan Tematik Kampung Herbal"
      />
      <section className="bg-herbal-cream py-10 sm:py-12">
        <Container>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {streets.map((street, index) => (
            <StreetCard key={street.slug} priority={index === 0} street={street} />
          ))}
        </div>
      </Container>
      </section>
    </>
  );
}
