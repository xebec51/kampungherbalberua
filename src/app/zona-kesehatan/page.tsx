import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ZoneCatalog } from "@/components/zones/ZoneCatalog";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { PageHero } from "@/components/ui/PageHero";
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
    <PageHero
      className="py-6 sm:py-7 lg:py-8"
      eyebrow="Kampung Herbal Harmony"
      title="Zona Kesehatan"
    >
      <Suspense
        fallback={
          <p className="text-sm text-herbal-muted">
            Memuat katalog zona kesehatan.
          </p>
        }
      >
        <ZoneCatalog zones={zones} />
      </Suspense>
      <Reveal className="mt-6 sm:mt-8">
        <Disclaimer>
          Materi pada halaman ini disediakan sebagai edukasi umum mengenai
          tema kesehatan pada Zona Kampung Herbal Harmony. Informasi ini bukan
          diagnosis, resep, atau pengganti konsultasi dengan dokter, apoteker,
          maupun tenaga kesehatan lainnya. Informasi tanaman herbal harus
          diverifikasi sebelum digunakan.
        </Disclaimer>
      </Reveal>
    </PageHero>
  );
}
