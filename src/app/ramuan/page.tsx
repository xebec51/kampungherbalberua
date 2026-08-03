import type { Metadata } from "next";
import { Suspense } from "react";
import { RecipeCatalog } from "@/components/recipes/RecipeCatalog";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { recipes } from "@/data/recipes";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Ramuan Sehat",
  description:
    "Daftar ramuan sehat Kampung Herbal Berua untuk edukasi pemanfaatan tradisional.",
  path: "/ramuan",
});

export default function RecipesPage() {
  return (
    <section className="bg-herbal-cream py-8 sm:py-10">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Ramuan Sehat"
            title="Edukasi ramuan berbasis tanaman sekitar"
          />
        </Reveal>
        {recipes.length > 0 ? (
          <Suspense
            fallback={
              <p className="mt-5 text-sm text-herbal-muted">
                Memuat katalog ramuan.
              </p>
            }
          >
            <RecipeCatalog recipes={recipes} />
          </Suspense>
        ) : null}
        <Reveal>
          <div className="mt-8">
            <Disclaimer>
              Informasi ramuan pada website ini bukan diagnosis, resep, atau
              pengganti konsultasi dengan dokter, apoteker, maupun tenaga kesehatan
              lainnya. Ibu hamil, anak-anak, lansia, penderita penyakit tertentu,
              dan pengguna obat rutin perlu berkonsultasi sebelum mengonsumsi
              ramuan.
            </Disclaimer>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
