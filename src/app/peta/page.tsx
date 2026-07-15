import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Peta Kampung",
  description:
    "Halaman placeholder pemetaan Kampung Herbal Berua bersama tim Perencanaan Wilayah dan Kota.",
  path: "/peta",
});

const plannedLayers = [
  "Tanaman",
  "Jalan dan lorong",
  "Fasilitas umum",
  "Lokasi kunjungan",
  "Produk atau UMKM warga",
  "Data kesehatan agregat",
];

const acceptedFormats = ["Gambar denah", "Tabel koordinat", "GeoJSON", "KML"];

export default function MapPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Halaman ini disiapkan untuk menampung hasil denah dan pemetaan Kampung Herbal. Peta interaktif belum diaktifkan pada tahap pertama."
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
            label="Ilustrasi placeholder peta Kampung Herbal"
            variant="map"
          />
          <div className="grid gap-5">
            <InfoPanel title="Lapisan peta yang direncanakan" values={plannedLayers} />
            <InfoPanel title="Format data yang dapat diterima" values={acceptedFormats} />
            <div className="rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-7 text-herbal-muted shadow-sm">
              Data kesehatan hanya akan ditampilkan dalam bentuk agregat per zona
              dan tidak menampilkan identitas warga, alamat rumah, atau kondisi
              kesehatan individual.
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
