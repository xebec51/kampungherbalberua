import type { Metadata } from "next";
import { StreetCard } from "@/components/streets/StreetCard";
import { BrandCard } from "@/components/ui/BrandCard";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getHerbaCodeZoneSummaries } from "@/lib/data/herbacode";
import { getPublishedStreets } from "@/lib/data/streets";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Peta Kampung",
  description:
    "Daftar zona HerbaCode Kampung Herbal Berua tanpa data pribadi warga.",
  path: "/peta",
});

export default async function MapPage() {
  const [zones, streets] = await Promise.all([
    getHerbaCodeZoneSummaries(),
    getPublishedStreets(),
  ]);

  return (
    <>
      <PageHero
        description="Daftar zona HerbaCode dan jalan tematik Kampung Herbal tanpa titik rumah, koordinat warga, atau data kesehatan perorangan."
        eyebrow="Pemetaan"
        title="Peta Kampung Herbal"
      />
      <section className="bg-herbal-cream py-10 sm:py-12">
        <Container>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <InfoPanel
            title="Zona HerbaCode"
            values={zones.map((zone) =>
              zone.streetNames.length > 0
                ? `${zone.title} - ${zone.streetNames.join(", ")}`
                : zone.title,
            )}
          />
          <div className="grid gap-5">
            <BrandCard className="text-sm leading-7 text-herbal-muted">
              Zona pada halaman ini bukan diagnosis wilayah dan bukan data
              penyakit warga. Website tidak menampilkan peta rumah pasien,
              alamat warga, koordinat pasien, atau kondisi kesehatan per rumah.
            </BrandCard>
          </div>
        </div>
        {streets.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-herbal-ink">
              Jalan tematik
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {streets.map((street) => (
                <StreetCard key={street.slug} street={street} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
      </section>
    </>
  );
}

type InfoPanelProps = {
  title: string;
  values: string[];
};

function InfoPanel({ title, values }: InfoPanelProps) {
  if (values.length === 0) {
    return null;
  }

  return (
    <BrandCard as="section">
      <h2 className="text-lg font-bold text-herbal-ink">{title}</h2>
      <ul className="mt-4 grid gap-2 text-sm text-herbal-muted">
        {values.map((value) => (
          <li className="flex gap-2" key={value}>
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-herbal-green" />
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </BrandCard>
  );
}
