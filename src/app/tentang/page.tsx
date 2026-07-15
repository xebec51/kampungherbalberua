import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Tentang",
  description:
    "Profil singkat Kampung Herbal RT 009/RW 006 Kelurahan Berua, Kecamatan Biringkanaya, Kota Makassar.",
  path: "/tentang",
});

export default function AboutPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Kampung Herbal Berua dikembangkan sebagai ruang kolaborasi warga dan mahasiswa KKN untuk mengenalkan tanaman obat keluarga, ramuan tradisional yang aman, potensi wilayah, produk masyarakat, dan layanan aspirasi publik."
          eyebrow="Tentang"
          title="Profil Kampung Herbal Berua"
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-herbal-ink">
              Portal digital warga
            </h2>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-herbal-muted">
              <p>
                Website ini menjadi fondasi portal publik Kampung Herbal RT
                009/RW 006 Kelurahan Berua, Kecamatan Biringkanaya, Kota
                Makassar. Tujuannya adalah memudahkan warga dan pengunjung
                mengenal tanaman TOGA, dokumentasi kegiatan, peta wilayah, dan
                produk masyarakat.
              </p>
              <p>
                Tahap pertama berfokus pada halaman publik dan struktur data
                lokal. Integrasi database, admin, QR Code dinamis, dan peta
                interaktif disiapkan untuk tahap berikutnya.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
            <StatusBadge tone="brown">Data demonstrasi</StatusBadge>
            <h2 className="mt-4 text-2xl font-bold text-herbal-ink">
              Ruang integrasi proker
            </h2>
            <p className="mt-4 text-sm leading-7 text-herbal-muted">
              Hasil program dari bidang Sistem Informasi, Farmasi, Perencanaan
              Wilayah dan Kota, Administrasi Publik, Ilmu Ekonomi, dan Psikologi
              akan diintegrasikan secara bertahap berdasarkan hasil pendataan
              lapangan.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/tim" variant="secondary">
                Lihat Tim KKN
              </LinkButton>
              <LinkButton href="/kegiatan" variant="ghost">
                Lihat Kegiatan
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
