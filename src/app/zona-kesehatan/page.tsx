import type { Metadata } from "next";
import { HealthZoneCard } from "@/components/zones/HealthZoneCard";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedHealthZones } from "@/lib/data/health-zones";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: "Zona Kesehatan",
  description:
    "Daftar sembilan zona kesehatan tematik Kampung Herbal Harmony di Kampung Herbal Berua.",
  path: "/zona-kesehatan",
});

export default async function HealthZonesPage() {
  const zones = await getPublishedHealthZones();

  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Kampung Herbal Harmony adalah identitas program zona kesehatan tematik di kawasan Kampung Herbal Berua. Setiap zona memiliki kode QR permanen berbasis kode zona."
          eyebrow="Kampung Herbal Harmony"
          title="Zona Kesehatan"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone, index) => (
            <HealthZoneCard
              key={zone.zoneCode}
              priority={index === 0}
              zone={zone}
            />
          ))}
        </div>
        <div className="mt-8">
          <Disclaimer>
            Materi pada halaman ini disediakan sebagai edukasi umum mengenai
            tema kesehatan pada Zona Kampung Herbal Harmony. Informasi ini bukan
            diagnosis, resep, atau pengganti konsultasi dengan dokter, apoteker,
            maupun tenaga kesehatan lainnya. Informasi tanaman herbal harus
            diverifikasi sebelum digunakan.
          </Disclaimer>
        </div>
      </Container>
    </section>
  );
}
