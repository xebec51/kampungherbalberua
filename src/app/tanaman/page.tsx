import { Suspense } from "react";
import type { Metadata } from "next";
import { PosterPlantCatalog } from "@/components/plants/PosterPlantCatalog";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPosterPlantCatalog } from "@/lib/data/poster-plants";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: "Katalog Tanaman Kampung Herbal Harmony",
  description:
    "Katalog tanaman Kampung Herbal Harmony untuk mengenal tanaman, zona edukasi, dan konteks wilayah RT 009/RW 006 Kelurahan Berua.",
  path: "/tanaman",
});

export default async function PlantsPage() {
  const plants = await getPosterPlantCatalog();
  const zoneCount = new Set(plants.flatMap((plant) => plant.collections)).size;
  const imageCount = plants.filter((plant) => Boolean(plant.image)).length;

  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Kampung Herbal Harmony adalah program pengenalan tanaman dan zona kesehatan di RT 009/RW 006 Kelurahan Berua. Katalog ini membantu pengunjung mengenal nama tanaman, zona edukasi, dan gambar pendamping walaupun tidak sedang berada di lokasi."
          eyebrow="Katalog Tanaman"
          title="Katalog Tanaman Kampung Herbal Harmony"
        />
        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          <CatalogMetric
            label="Nama tanaman"
            value={String(plants.length)}
            description="Nama yang tercatat dalam katalog edukasi Harmony."
          />
          <CatalogMetric
            label="Zona edukasi"
            value={String(zoneCount)}
            description="Wilayah tematik tempat tanaman dikenalkan."
          />
          <CatalogMetric
            label="Gambar pendamping"
            value={String(imageCount)}
            description="Foto atau ilustrasi beratribusi untuk membantu pengenalan."
          />
        </dl>
        <Suspense fallback={<p className="mt-8 text-sm text-herbal-muted">Memuat katalog tanaman...</p>}>
          <PosterPlantCatalog plants={plants} />
        </Suspense>
        <div className="mt-8">
          <Disclaimer>
            Informasi tanaman pada website ini disediakan untuk edukasi mengenai
            pemanfaatan tradisional. Informasi ini bukan diagnosis, resep, atau
            pengganti konsultasi dengan dokter, apoteker, maupun tenaga kesehatan
            lainnya.
          </Disclaimer>
        </div>
      </Container>
    </section>
  );
}

function CatalogMetric({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <dt className="text-sm font-bold text-herbal-muted">{label}</dt>
      <dd className="mt-2 text-3xl font-extrabold text-herbal-deep">
        {value}
      </dd>
      <p className="mt-2 text-sm leading-6 text-herbal-muted">
        {description}
      </p>
    </div>
  );
}
