import type { Metadata } from "next";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { recipes } from "@/data/recipes";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Ramuan Sehat",
  description:
    "Daftar materi awal ramuan sehat Kampung Herbal Berua untuk edukasi pemanfaatan tradisional.",
  path: "/ramuan",
});

export default function RecipesPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Ramuan pada halaman ini masih berupa contoh edukasi pemanfaatan tradisional. Takaran, bahan, dan peringatan perlu diverifikasi oleh tim Farmasi atau tenaga kesehatan."
          eyebrow="Ramuan Sehat"
          title="Edukasi ramuan berbasis tanaman sekitar"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
        <div className="mt-8">
          <Disclaimer>
            Informasi ramuan pada website ini bukan diagnosis, resep, atau
            pengganti konsultasi dengan dokter, apoteker, maupun tenaga kesehatan
            lainnya. Ibu hamil, anak-anak, lansia, penderita penyakit tertentu,
            dan pengguna obat rutin perlu berkonsultasi sebelum mengonsumsi
            ramuan.
          </Disclaimer>
        </div>
      </Container>
    </section>
  );
}
