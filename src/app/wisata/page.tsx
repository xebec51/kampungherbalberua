import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Kunjungan Edukasi",
  description: "Informasi kunjungan edukasi Kampung Herbal Berua.",
  path: "/wisata",
});

export default function TourismPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Reveal>
          <SectionHeading
            description="Data kunjungan edukasi yang telah memiliki informasi publik akan ditampilkan di halaman ini."
            eyebrow="Kunjungan Edukasi"
            title="Kunjungan Edukasi Kampung Herbal"
          />
        </Reveal>
      </Container>
    </section>
  );
}
