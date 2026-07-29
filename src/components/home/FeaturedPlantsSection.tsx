import { PlantCard } from "@/components/plants/PlantCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedPlants } from "@/lib/data/plants";

export async function FeaturedPlantsSection() {
  const featuredPlants = await getFeaturedPlants(3);

  return (
    <section className="home-section bg-gradient-to-b from-white via-herbal-cream to-white py-14 sm:py-16">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Cuplikan tanaman yang dikenalkan dalam Kampung Herbal Harmony, program edukasi tanaman dan zona kesehatan di RT 009/RW 006 Kelurahan Berua."
            eyebrow="Tanaman Pilihan"
            title="Kenali tanaman herbal kampung"
          />
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/tanaman" variant="secondary">
              Lihat katalog tanaman Harmony
            </LinkButton>
          </div>
        </div>
        <AutoCarousel
          ariaLabel="Carousel tanaman pilihan"
          className="mt-8"
          edgeTone="cream"
          itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[30%] xl:basis-[23%] xl:max-w-[18rem]"
        >
          {featuredPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
