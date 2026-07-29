import type { Metadata } from "next";
import { HerbaCodeZoneCard } from "@/components/zones/HerbaCodeZoneCard";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getHerbaCodeZoneSummaries } from "@/lib/data/herbacode";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: "Zona Kesehatan",
  description:
    "Daftar zona kesehatan HerbaCode Kampung Herbal Harmony di Kampung Herbal Berua.",
  path: "/zona-kesehatan",
});

export default async function HealthZonesPage() {
  const zones = await getHerbaCodeZoneSummaries();

  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Setiap zona HerbaCode mengelompokkan tanaman, senyawa aktif, bagian yang digunakan, manfaat, budidaya, perhatian, dan cara pemanfaatan bila tersedia."
          eyebrow="Kampung Herbal Harmony"
          title="Zona Kesehatan"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <HerbaCodeZoneCard key={zone.zoneCode} zone={zone} />
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
