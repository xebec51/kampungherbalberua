import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { AgeDistributionMapSection } from "@/components/maps/AgeDistributionMapSection";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { programs } from "@/data/programs";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Kinerja RT",
  description:
    "Informasi program, kategori, progres RT, dan dokumentasi Peta Persebaran Kelompok Usia RT 009/RW 006 Berua.",
  path: "/kinerja-rt",
});

export default function RtPerformancePage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              description="Halaman ini menampilkan program, kategori, status, dan progres RT secara transparan."
              eyebrow="Kinerja RT"
              title="Program dan capaian RT"
            />
            <StatusBadge tone="brown">Laporan Program RT</StatusBadge>
          </div>
        </Reveal>
        <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program) => (
            <StaggerItem key={program.id}>
              <ProgramCard program={program} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal>
          <AgeDistributionMapSection />
        </Reveal>
      </Container>
    </section>
  );
}
