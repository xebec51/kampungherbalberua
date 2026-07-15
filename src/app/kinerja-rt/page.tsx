import type { Metadata } from "next";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { programs } from "@/data/programs";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Kinerja RT",
  description:
    "Informasi program RT Kampung Herbal Berua dengan status progres yang masih dalam pendataan.",
  path: "/kinerja-rt",
});

export default function RtPerformancePage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Halaman ini disiapkan untuk menampilkan program, kategori, status, dan progres RT secara transparan setelah data tersedia."
            eyebrow="Kinerja RT"
            title="Program dan capaian RT"
          />
          <StatusBadge tone="brown">Progres dalam pendataan</StatusBadge>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </Container>
    </section>
  );
}
