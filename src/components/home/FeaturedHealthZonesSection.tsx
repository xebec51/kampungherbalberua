import { Reveal } from "@/components/motion/Reveal";
import { HerbaCodeZoneCard } from "@/components/zones/HerbaCodeZoneCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getHerbaCodeZoneSummaries } from "@/lib/data/herbacode";

export async function FeaturedHealthZonesSection() {
  const zones = await getHerbaCodeZoneSummaries();

  return (
    <section className="home-section bg-herbal-soft py-14 sm:py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              description="Zona HerbaCode mengelompokkan tanaman berdasarkan tema kesehatan dan menyimpan manfaat sesuai zona masing-masing."
              eyebrow="Zona Kesehatan"
              title="Jelajahi Zona Kesehatan"
            />
            <LinkButton href="/zona-kesehatan" variant="secondary">
              Lihat Semua Zona
            </LinkButton>
          </div>
        </Reveal>
        <AutoCarousel
          ariaLabel="Carousel zona kesehatan"
          className="mt-8"
          itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[30%] xl:basis-[23%] xl:max-w-[18rem]"
        >
          {zones.map((zone) => (
            <HerbaCodeZoneCard key={zone.zoneCode} zone={zone} />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
