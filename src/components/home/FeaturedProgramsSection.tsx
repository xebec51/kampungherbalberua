import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredPrograms } from "@/data/programs";

export function FeaturedProgramsSection() {
  if (featuredPrograms.length === 0) {
    return null;
  }

  return (
    <section className="home-section bg-white py-14 sm:py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              description="Program kerja (proker) yang sedang dan telah dijalankan untuk mewujudkan Kampung Herbal Harmony."
              eyebrow="Program Kerja"
              title="Proker Kampung Herbal"
            />
            <LinkButton href="/kinerja-rt" variant="secondary">
              Lihat Kinerja RT
            </LinkButton>
          </div>
        </Reveal>
        <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredPrograms.map((program) => (
            <StaggerItem key={program.id}>
              <ProgramCard program={program} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
