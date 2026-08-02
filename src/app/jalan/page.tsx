import type { Metadata } from "next";
import { StreetCard } from "@/components/streets/StreetCard";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
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
          <StaggerGroup className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {streets.map((street, index) => (
              <StaggerItem key={street.slug}>
                <StreetCard priority={index === 0} street={street} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>
    </>
  );
}
