import { Suspense } from "react";
import type { Metadata } from "next";
import { HerbaCodePlantCatalog } from "@/components/plants/HerbaCodePlantCatalog";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getHerbaCodePlantCatalog,
  getHerbaCodeZoneSummaries,
} from "@/lib/data/herbacode";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: "Katalog Tanaman Kampung Herbal Harmony",
  description:
    "Katalog tanaman Kampung Herbal Harmony untuk mengenal tanaman, zona edukasi, dan konteks wilayah RT 009/RW 006 Kelurahan Berua.",
  path: "/tanaman",
});

export default async function PlantsPage() {
  const [plants, zones] = await Promise.all([
    getHerbaCodePlantCatalog(),
    getHerbaCodeZoneSummaries(),
  ]);
  const entryCount = plants.reduce(
    (total, plant) => total + plant.zoneEntries.length,
    0,
  );

  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Katalog ini memakai data HerbaCode Kampung Herbal Harmony sebagai sumber profil tanaman, zona kesehatan, senyawa aktif, bagian tanaman, budidaya, perhatian, dan pemanfaatan tradisional yang tersedia."
          eyebrow="Katalog Tanaman"
          title="Katalog Tanaman Kampung Herbal Harmony"
        />
        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          <CatalogMetric
            label="Nama tanaman"
            value={String(plants.length)}
            description="Tanaman unik yang terhubung dengan data HerbaCode."
          />
          <CatalogMetric
            label="Zona HerbaCode"
            value={String(zones.length)}
            description="Zona kesehatan yang terbaca dari dokumen sumber."
          />
          <CatalogMetric
            label="Relasi tanaman-zona"
            value={String(entryCount)}
            description="Setiap relasi menyimpan manfaat sesuai zona."
          />
        </dl>
        <Suspense fallback={<p className="mt-8 text-sm text-herbal-muted">Memuat katalog tanaman.</p>}>
          <HerbaCodePlantCatalog plants={plants} />
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
