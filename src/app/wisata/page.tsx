import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Kunjungan Edukasi",
  description:
    "Informasi awal kunjungan edukasi Kampung Herbal Berua yang masih disusun.",
  path: "/wisata",
});

const visitItems = [
  "Kebun herbal",
  "Lorong tanaman",
  "Workshop ramuan",
  "Lokasi produk warga",
  "Informasi jadwal kunjungan",
  "Kontak pengelola",
];

export default function TourismPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Halaman ini menggunakan istilah Kunjungan Edukasi Kampung Herbal. Informasi resmi mengenai jadwal, pengelola, dan alur kunjungan masih disusun."
          eyebrow="Kunjungan Edukasi"
          title="Kunjungan Edukasi Kampung Herbal"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visitItems.map((item) => (
            <article
              className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm"
              key={item}
            >
              <ImagePlaceholder
                label={`Ilustrasi placeholder ${item.toLowerCase()}`}
                variant={item.includes("produk") ? "product" : "plant"}
              />
              <StatusBadge className="mt-5" tone="brown">
                Informasi kunjungan sedang disusun
              </StatusBadge>
              <h2 className="mt-4 text-xl font-bold text-herbal-ink">{item}</h2>
              <p className="mt-3 text-sm leading-6 text-herbal-muted">
                Detail ini belum menjadi informasi kunjungan formal dan akan
                diperbarui setelah data pengelola tersedia.
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
