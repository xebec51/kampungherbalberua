import type { Metadata } from "next";
import Link from "next/link";
import { CommunityMapPlaceholder } from "@/components/maps/CommunityMapPlaceholder";
import { InteractiveMap } from "@/components/maps/InteractiveMap";
import { MapLegend } from "@/components/maps/MapLegend";
import { MapLocationCard } from "@/components/maps/MapLocationCard";
import { HoverCard } from "@/components/motion/HoverCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { StreetCard } from "@/components/streets/StreetCard";
import { BrandCard } from "@/components/ui/BrandCard";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { communityMapConfig } from "@/data/map-config";
import { getHerbaCodeZoneSummaries } from "@/lib/data/herbacode";
import { getPublishedStreets } from "@/lib/data/streets";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Peta Kampung",
  description:
    "Akses lokasi, jalan tematik, dan zona kesehatan Kampung Herbal Harmony Berua tanpa data pribadi warga.",
  path: "/peta",
});

export default async function MapPage() {
  const [zones, streets] = await Promise.all([
    getHerbaCodeZoneSummaries(),
    getPublishedStreets(),
  ]);

  return (
    <>
      <PageHero
        description="Peta publik Kampung Herbal Harmony Berua menampilkan jalan tematik, zona kesehatan, fasilitas, pintu masuk, dan titik informasi kampung."
        eyebrow="Pemetaan"
        title="Peta Kampung Herbal"
      />
      <section className="bg-herbal-cream py-10 sm:py-12">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-stretch">
            <MapLocationCard />
            <CommunityMapPlaceholder />
          </div>

          <div className="mt-6">
            <InteractiveMap />
          </div>

          <div className="mt-6">
            <MapLegend />
          </div>

          <section className="mt-10">
            <Reveal>
              <SectionHeading
                description="Daftar ini menjadi navigasi menuju detail setiap zona kesehatan Kampung Herbal Berua."
                eyebrow="Zona kesehatan"
                title="Daftar Zona Kesehatan"
              />
            </Reveal>
            <StaggerGroup className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {zones.map((zone) => (
                <StaggerItem key={zone.slug}>
                  <Link
                    className="block h-full rounded-[var(--radius-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                    href={`/zona-kesehatan/${zone.slug}`}
                  >
                    <HoverCard
                      as="div"
                      className="public-card h-full rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-3.5 shadow-[var(--shadow-soft)] sm:p-5"
                    >
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-herbal-brown sm:text-xs">
                        Zona kesehatan
                      </p>
                      <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:mt-3 sm:text-lg">
                        {zone.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
                        {zone.shortDescription}
                      </p>
                      <p className="mt-3 text-xs font-bold text-herbal-green sm:mt-4 sm:text-sm">
                        {zone.plantCount} tanaman
                      </p>
                    </HoverCard>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>

          {streets.length > 0 ? (
            <section className="mt-12">
              <Reveal>
                <SectionHeading
                  description="Daftar jalan tematik tersedia sebagai navigasi aksesibel ke setiap papan dokumentasi."
                  eyebrow="Jalan tematik"
                  title="Daftar Jalan Tematik"
                />
              </Reveal>
              <StaggerGroup className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {streets.map((street) => (
                  <StaggerItem key={street.slug}>
                    <StreetCard street={street} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </section>
          ) : null}

          <BrandCard className="mt-10 text-sm leading-7 text-herbal-muted">
            <h2 className="text-lg font-bold text-herbal-ink">
              Catatan privasi dan atribusi
            </h2>
            <p className="mt-3">{communityMapConfig.privacyNote}</p>
            <p className="mt-3">{communityMapConfig.attributionNote}</p>
          </BrandCard>
        </Container>
      </section>
    </>
  );
}
