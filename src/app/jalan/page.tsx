import type { Metadata } from "next";
import { StreetCard } from "@/components/streets/StreetCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Jalan tematik adalah dokumentasi fisik wilayah. Data tanaman jalan dipasangkan dari tema papan dan katalog poster Kampung Herbal, bukan dari relasi zona HerbaCode."
          eyebrow="Jalan Tematik"
          title="Jalan Tematik Kampung Herbal"
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {streets.map((street, index) => (
            <StreetCard key={street.slug} priority={index === 0} street={street} />
          ))}
        </div>
      </Container>
    </section>
  );
}
