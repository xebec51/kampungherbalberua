import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getHerbaCodeZoneSummaries } from "@/lib/data/herbacode";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Peta Kampung",
  description:
    "Daftar zona HerbaCode Kampung Herbal Berua tanpa data pribadi warga.",
  path: "/peta",
});

export default async function MapPage() {
  const zones = await getHerbaCodeZoneSummaries();

  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Halaman ini menampilkan daftar zona HerbaCode tanpa titik rumah, koordinat warga, atau data kesehatan perorangan."
          eyebrow="Pemetaan"
          title="Peta Kampung Herbal"
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <InfoPanel
            title="Zona HerbaCode"
            values={zones.map((zone) => `${zone.zoneCode} - ${zone.title}`)}
          />
          <div className="rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-7 text-herbal-muted shadow-sm">
            Zona pada halaman ini bukan diagnosis wilayah dan bukan data
            penyakit warga. Website tidak menampilkan peta rumah pasien, alamat
            warga, koordinat pasien, atau kondisi kesehatan per rumah.
          </div>
        </div>
      </Container>
    </section>
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
    <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-herbal-ink">{title}</h2>
      <ul className="mt-4 grid gap-2 text-sm text-herbal-muted">
        {values.map((value) => (
          <li className="flex gap-2" key={value}>
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-herbal-green" />
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
