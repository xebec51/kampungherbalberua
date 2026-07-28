import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PublicCard, PublicCardBody } from "@/components/ui/PublicCard";
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
            <PublicCard key={item}>
              <ImagePlaceholder
                className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
                label={`Gambar sementara ${item.toLowerCase()}`}
                variant={item.includes("produk") ? "product" : "plant"}
              />
              <PublicCardBody>
                <StatusBadge tone="brown">
                  Informasi kunjungan sedang disusun
                </StatusBadge>
                <h2 className="mt-4 text-lg font-bold leading-tight text-herbal-ink">
                  {item}
                </h2>
                <p className="mt-3 text-sm leading-6 text-herbal-muted">
                  Detail ini belum menjadi informasi kunjungan formal dan akan
                  diperbarui setelah data pengelola tersedia.
                </p>
              </PublicCardBody>
            </PublicCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
