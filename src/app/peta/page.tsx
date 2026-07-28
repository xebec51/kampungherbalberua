import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getPublishedHealthZones } from "@/lib/data/health-zones";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Peta Kampung",
  description:
    "Halaman placeholder pemetaan Kampung Herbal Berua bersama tim Perencanaan Wilayah dan Kota.",
  path: "/peta",
});

const plannedLayers = [
  "Sembilan jalan atau zona kesehatan tematik",
  "Blok tiap zona untuk kebutuhan papan informasi",
  "Rute kunjungan edukasi tanpa data pribadi warga",
  "Denah final bersama tim Perencanaan Wilayah dan Kota",
];

export default async function MapPage() {
  const zones = await getPublishedHealthZones();

  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Kawasan Kampung Herbal Harmony dibagi menjadi sembilan zona tematik. Denah interaktif belum dipasang dan masih disusun bersama tim Perencanaan Wilayah dan Kota."
            eyebrow="Pemetaan"
            title="Peta Kampung Herbal"
          />
          <StatusBadge tone="green">
            Pemetaan sedang disusun bersama tim Perencanaan Wilayah dan Kota
          </StatusBadge>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ImagePlaceholder
            className="aspect-[16/10]"
            label="Gambar sementara peta Kampung Herbal"
            variant="map"
          />
          <div className="grid gap-5">
            <InfoPanel title="Lapisan peta yang direncanakan" values={plannedLayers} />
            <InfoPanel
              title="Zona tematik"
              values={zones.map(
                (zone) =>
                  `${zone.streetName} - ${zone.zoneName} (${zone.blockRanges.join(", ")})`,
              )}
            />
            <div className="rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-7 text-herbal-muted shadow-sm">
              Zona pada halaman ini bukan diagnosis wilayah dan bukan data
              penyakit warga. Website tidak menampilkan peta rumah pasien,
              alamat warga, koordinat pasien, atau kondisi kesehatan per rumah.
            </div>
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
