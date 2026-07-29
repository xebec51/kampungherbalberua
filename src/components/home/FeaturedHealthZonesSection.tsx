import { HealthZoneCard } from "@/components/zones/HealthZoneCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedHealthZones } from "@/lib/data/health-zones";

export async function FeaturedHealthZonesSection() {
  const zones = await getPublishedHealthZones();

  return (
    <section className="home-section bg-herbal-cream py-14 sm:py-16">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Kampung Herbal Harmony membagi kawasan menjadi zona tematik untuk edukasi kebiasaan hidup sehat. Materi bersifat umum dan menunggu verifikasi tenaga kesehatan."
            eyebrow="Zona Kesehatan"
            title="Jelajahi Zona Kesehatan"
          />
          <LinkButton href="/zona-kesehatan" variant="secondary">
            Lihat Semua Zona
          </LinkButton>
        </div>
        <AutoCarousel
          ariaLabel="Carousel zona kesehatan"
          className="mt-8"
          itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[30%] xl:basis-[23%] xl:max-w-[18rem]"
        >
          {zones.map((zone, index) => (
            <HealthZoneCard
              key={zone.zoneCode}
              priority={index === 0}
              zone={zone}
            />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
