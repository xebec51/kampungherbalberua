import { Reveal } from "@/components/motion/Reveal";
import { HealthConditionCard } from "@/components/health-conditions/HealthConditionCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getHealthConditions } from "@/lib/data/health-conditions";

export async function FeaturedHealthConditionsSection() {
  const healthConditions = await getHealthConditions();

  if (healthConditions.length === 0) {
    return null;
  }

  return (
    <section className="home-section bg-herbal-soft py-14 sm:py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              description="Katalog penyakit mengelompokkan tanaman berdasarkan kondisi kesehatan yang secara tradisional didukung olehnya."
              eyebrow="Katalog Penyakit"
              title="Jelajahi Katalog Penyakit"
            />
            <LinkButton href="/penyakit" variant="secondary">
              Lihat Semua Penyakit
            </LinkButton>
          </div>
        </Reveal>
        <AutoCarousel
          ariaLabel="Carousel katalog penyakit"
          className="mt-8"
          itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[24%] xl:basis-[19%]"
        >
          {healthConditions.map((healthCondition) => (
            <HealthConditionCard
              healthCondition={healthCondition}
              key={healthCondition.id}
            />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
