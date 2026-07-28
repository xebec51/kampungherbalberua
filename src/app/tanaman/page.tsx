import type { Metadata } from "next";
import { PosterPlantCatalog } from "@/components/plants/PosterPlantCatalog";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPosterPlantCatalog } from "@/lib/data/poster-plants";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: "Tanaman Kampung Herbal Harmony",
  description:
    "Katalog nama tanaman yang tercantum pada Peta Tanaman Obat Kampung Herbal Harmony.",
  path: "/tanaman",
});

export default async function PlantsPage() {
  const plants = await getPosterPlantCatalog();

  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Katalog nama tanaman yang tercantum pada Peta Tanaman Obat Kampung Herbal Harmony. Gambar tertentu merupakan ilustrasi referensi dari sumber berlisensi."
          eyebrow="Katalog Tanaman"
          title="Tanaman Kampung Herbal Harmony"
        />
        <PosterPlantCatalog plants={plants} />
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
