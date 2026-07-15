import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ProfileSection() {
  return (
    <section className="bg-herbal-cream py-16">
      <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          description="Portal ini disiapkan sebagai ruang informasi publik untuk menghubungkan program Kampung Herbal, data tanaman TOGA, kegiatan warga, hasil pemetaan, dan layanan aspirasi masyarakat."
          eyebrow="Profil Singkat"
          title="Kampung Herbal Berua"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Lokasi administratif: RT 009/RW 006, Kelurahan Berua, Kecamatan Biringkanaya, Kota Makassar.",
            "Konten tahap pertama masih berupa data demonstrasi dan akan diperbarui setelah pendataan lapangan selesai.",
            "Informasi kesehatan ditulis sebagai edukasi pemanfaatan tradisional dan bukan pengganti konsultasi tenaga kesehatan.",
            "Struktur website disiapkan agar hasil program KKN tiap bidang dapat diintegrasikan bertahap.",
          ].map((item) => (
            <p
              className="rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm"
              key={item}
            >
              {item}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}
