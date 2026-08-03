import { Reveal } from "@/components/motion/Reveal";
import { StreetCard } from "@/components/streets/StreetCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedStreets } from "@/lib/data/streets";

export async function FeaturedStreetsSection() {
  const streets = await getPublishedStreets();

  if (streets.length === 0) {
    return null;
  }

  return (
    <section className="home-section bg-white py-14 sm:py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              description="Sembilan jalan tematik ditata sebagai penanda fisik kampung. Setiap jalan memakai foto papan asli dan daftar tanaman dari katalog poster."
              eyebrow="Jalan Tematik"
              title="Rute tematik Kampung Herbal"
            />
            <LinkButton href="/jalan" variant="secondary">
              Lihat Semua Jalan
            </LinkButton>
          </div>
        </Reveal>
        <AutoCarousel
          ariaLabel="Carousel jalan tematik"
          className="mt-8"
          edgeTone="white"
          itemClassName="basis-[84%] sm:basis-[48%] lg:basis-[24%] xl:basis-[19%]"
        >
          {streets.map((street, index) => (
            <StreetCard key={street.slug} priority={index === 0} street={street} />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
