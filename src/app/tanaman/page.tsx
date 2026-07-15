import type { Metadata } from "next";
import { PlantCatalog } from "@/components/plants/PlantCatalog";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { plantCategories, plants } from "@/data/plants";

export const metadata: Metadata = {
  title: "Tanaman TOGA | Kampung Herbal Berua",
  description:
    "Katalog demonstrasi tanaman TOGA Kampung Herbal Berua dengan pencarian dan filter kategori.",
};

export default function PlantsPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Daftar ini masih berupa data demonstrasi. Setiap informasi tanaman perlu diverifikasi oleh tim Farmasi atau tenaga kesehatan sebelum menjadi rujukan publik final."
          eyebrow="Katalog Tanaman"
          title="Tanaman TOGA Kampung Herbal Berua"
        />
        <PlantCatalog categories={plantCategories} plants={plants} />
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
