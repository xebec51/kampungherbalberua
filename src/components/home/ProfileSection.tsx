import { Container } from "@/components/ui/Container";
import { PartnerLogos } from "@/components/ui/PartnerLogos";
import { SectionHeading } from "@/components/ui/SectionHeading";

const profilePoints = [
  {
    label: "Wilayah",
    value:
      "RT 009/RW 006, Kelurahan Berua, Kecamatan Biringkanaya, Kota Makassar.",
  },
  {
    label: "Harmony",
    value:
      "Kampung Herbal Harmony adalah program pengenalan tanaman, zona edukasi kesehatan, dan potensi kampung dalam satu identitas digital.",
  },
  {
    label: "Katalog",
    value:
      "Pengunjung dapat mengenali nama tanaman, zona tempat tanaman dikenalkan, dan gambar pendamping tanpa harus berada di lokasi.",
  },
  {
    label: "Edukasi",
    value:
      "Informasi kesehatan ditulis sebagai pemanfaatan tradisional dan bukan pengganti konsultasi tenaga kesehatan.",
  },
  {
    label: "Status",
    value:
      "Sebagian materi masih dapat diperbarui setelah pendataan dan verifikasi selesai.",
  },
];

export function ProfileSection() {
  return (
    <section className="home-section bg-herbal-cream py-20">
      <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <SectionHeading
            description="Portal ini memperkenalkan Kampung Herbal Harmony sebagai program edukasi berbasis wilayah. Pengunjung dapat memahami tanaman, zona kesehatan, peta kampung, produk warga, dan kegiatan program dari satu tempat."
            eyebrow="Profil Singkat"
            title="Kampung Herbal Berua"
          />
          <p className="mt-6 border-l-4 border-herbal-clay bg-white/70 px-5 py-4 text-base leading-7 text-herbal-muted shadow-sm">
            Website ini bukan hanya papan informasi digital. Isinya disusun
            agar warga, pengunjung, dan mitra program dapat memahami konteks
            Kampung Herbal Harmony meskipun tidak sedang berada di Berua.
          </p>
          <div className="mt-6 rounded-md border border-herbal-green/15 bg-herbal-green/[0.08] p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-herbal-brown">
              Kolaborasi Program
            </h3>
            <p className="mt-3 text-sm leading-6 text-herbal-muted">
              Identitas KKN Universitas Hasanuddin dan Pemerintah Kota Makassar
              ditampilkan sebagai bagian dari dokumentasi program.
            </p>
            <PartnerLogos className="mt-4" />
          </div>
        </div>
        <dl className="overflow-hidden rounded-md border border-herbal-green/15 bg-white shadow-[0_18px_50px_rgba(17,27,21,0.1)]">
          {profilePoints.map((item) => (
            <div
              className="grid gap-2 border-b border-herbal-green/10 p-5 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:p-6"
              key={item.label}
            >
              <dt className="text-sm font-bold uppercase tracking-[0.14em] text-herbal-brown">
                {item.label}
              </dt>
              <dd className="text-sm leading-6 text-herbal-muted sm:text-base sm:leading-7">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
