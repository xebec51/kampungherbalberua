import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HoverCard } from "@/components/motion/HoverCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { TeamMemberPhoto } from "@/components/team/TeamMemberPhoto";
import { programSupervisor, teamMembers } from "@/data/team";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Tentang",
  description:
    "Profil singkat Kampung Herbal RT 009/RW 006 Kelurahan Berua, Kecamatan Biringkanaya, Kota Makassar.",
  path: "/tentang",
});

const misiList = [
  "Menumbuhkan budaya menanam dan merawat tanaman obat keluarga (TOGA) di pekarangan dan lorong warga.",
  "Menyediakan edukasi kesehatan berbasis tanaman herbal yang aman, mudah dipahami, dan dapat dipertanggungjawabkan.",
  "Mendokumentasikan potensi wilayah, produk, dan kegiatan warga dalam satu portal digital yang mudah diakses.",
  "Mendorong pemberdayaan ekonomi warga melalui pengembangan produk dan potensi lokal berbasis herbal.",
  "Memperkuat partisipasi dan kebersamaan warga lewat pendekatan komunikasi yang hangat dan inklusif.",
];

const timelineSteps = [
  {
    title: "Pendataan & Perencanaan",
    description:
      "Mengumpulkan data wilayah, tanaman yang sudah tumbuh di pekarangan warga, serta aspirasi warga sebagai dasar penyusunan program.",
  },
  {
    title: "Penanaman & Zonasi TOGA",
    description:
      "Menata dan melengkapi tanaman obat keluarga bersama warga per zona, termasuk penandaan dan pengelompokan berdasarkan manfaatnya.",
  },
  {
    title: "Edukasi & Pendampingan Warga",
    description:
      "Menyampaikan informasi kesehatan berbasis tanaman herbal secara aman lewat kegiatan tatap muka maupun materi digital.",
  },
  {
    title: "Integrasi Digital & Publikasi",
    description:
      "Merangkum hasil pendataan, zona kesehatan, kegiatan, dan produk warga ke dalam portal digital ini agar mudah diakses publik.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-herbal-cream py-12 sm:py-16">
        <Container>
          <Reveal>
            <SectionHeading
              description="Kampung Herbal Berua dikembangkan sebagai ruang kolaborasi warga dan mahasiswa KKN untuk mengenalkan tanaman obat keluarga, ramuan tradisional yang aman, potensi wilayah, produk masyarakat, dan layanan aspirasi publik."
              eyebrow="Tentang"
              title="Profil Kampung Herbal Berua"
            />
          </Reveal>
          <Reveal className="mt-5" delay={0.05}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="green">KKN Prestasi Gelombang 116</StatusBadge>
              <StatusBadge tone="brown">Juli–Agustus 2026</StatusBadge>
              <a
                className="inline-flex items-center gap-1.5 rounded-full border border-herbal-green/20 bg-white px-3 py-1 text-xs font-bold text-herbal-green transition hover:border-herbal-green hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                href="https://www.instagram.com/kknprestasi116_berua/"
                rel="noreferrer"
                target="_blank"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <rect
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    width="18"
                    x="3"
                    y="3"
                  />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.5" cy="6.5" fill="currentColor" r="1.1" />
                </svg>
                @kknprestasi116_berua
              </a>
            </div>
          </Reveal>
          <StaggerGroup className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <StaggerItem>
              <HoverCard
                as="article"
                className="h-full rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
              >
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
                    Kampung Herbal Harmony adalah bagian dari inisiatif ini:
                    pengenalan tanaman, zona edukasi kesehatan, dan informasi
                    wilayah yang bisa dipahami pengunjung meskipun tidak sedang
                    berada di lokasi.
                  </p>
                </div>
              </HoverCard>
            </StaggerItem>
            <StaggerItem>
              <HoverCard
                as="article"
                className="h-full rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
              >
                <StatusBadge tone="brown">Kolaborasi Lintas Bidang</StatusBadge>
                <h2 className="mt-4 text-2xl font-bold text-herbal-ink">
                  Ruang integrasi proker
                </h2>
                <p className="mt-4 text-sm leading-7 text-herbal-muted">
                  Portal ini mengintegrasikan hasil program dari bidang Sistem
                  Informasi, Farmasi, Perencanaan Wilayah dan Kota, Administrasi
                  Publik, Ilmu Ekonomi, dan Psikologi berdasarkan hasil pendataan
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
              </HoverCard>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <Container>
          <Reveal>
            <SectionHeading
              description="Sebuah cerita singkat tentang titik awal Kampung Herbal Berua, dari pekarangan warga hingga menjadi program bersama."
              eyebrow="Latar Belakang"
              title="Kenapa Kampung Herbal Berua hadir"
            />
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <Reveal
              className="rounded-[var(--radius-card)] border border-herbal-green/15 bg-herbal-mist p-6 shadow-[var(--shadow-soft)]"
              delay={0.05}
            >
              <p className="text-sm leading-7 text-herbal-muted">
                Program ini lahir dari kegiatan Kuliah Kerja Nyata (KKN)
                Universitas Hasanuddin di RT 009/RW 006, Kelurahan Berua,
                Kecamatan Biringkanaya, Kota Makassar. Banyak warga sudah
                menanam dan memanfaatkan tanaman obat keluarga (TOGA) secara
                turun-temurun, namun pengetahuan tersebut sebagian besar masih
                tersebar lisan antarwarga dan belum terdokumentasi.
              </p>
              <p className="mt-4 text-sm leading-7 text-herbal-muted">
                Dari kondisi itulah gagasan Kampung Herbal Berua tumbuh:
                menjadikan pekarangan dan lorong warga sebagai ruang belajar
                bersama tentang TOGA, sekaligus merapikan informasinya agar
                mudah diakses siapa pun. Mahasiswa KKN dari bidang Sistem
                Informasi, Farmasi, Perencanaan Wilayah dan Kota, Administrasi
                Publik, Ilmu Ekonomi, dan Psikologi berkolaborasi bersama
                warga serta pengurus RT/RW untuk merancang pendekatan yang
                saling melengkapi, mulai dari pendataan tanaman dan wilayah,
                edukasi kesehatan yang aman, hingga penyusunan portal digital
                seperti yang sedang dikunjungi ini.
              </p>
            </Reveal>
            <Reveal
              className="h-full rounded-[var(--radius-card)] border-l-4 border-herbal-gold bg-herbal-cream/70 p-6 shadow-sm"
              delay={0.12}
            >
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-herbal-brown">
                Fokus Utama
              </h3>
              <p className="mt-3 text-sm leading-6 text-herbal-muted">
                Tanaman obat keluarga (TOGA) menjadi titik awal seluruh
                program: pengenalan jenis tanaman, manfaat tradisionalnya, dan
                cara pemanfaatan yang aman bagi warga, sebelum meluas ke
                potensi wilayah dan produk masyarakat lainnya.
              </p>
              <LinkButton
                className="mt-5"
                href="/zona-kesehatan"
                variant="ghost"
              >
                Lihat Zona Kesehatan
              </LinkButton>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-herbal-cream py-12 sm:py-16">
        <Container>
          <Reveal>
            <SectionHeading
              description="Arah bersama yang menjadi pegangan warga dan mahasiswa KKN dalam menjalankan program Kampung Herbal Berua."
              eyebrow="Visi & Misi"
              title="Arah yang ingin dituju bersama"
            />
          </Reveal>
          <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <Reveal delay={0.05}>
              <HoverCard
                as="article"
                className="h-full rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
              >
                <StatusBadge tone="green">Visi</StatusBadge>
                <p className="mt-4 text-lg font-bold leading-8 text-herbal-ink">
                  Menjadikan RT 009/RW 006 Kelurahan Berua sebagai kampung
                  herbal yang sehat, mandiri secara pengetahuan, dan dikenal
                  luas melalui pemanfaatan tanaman obat keluarga secara
                  berkelanjutan.
                </p>
              </HoverCard>
            </Reveal>
            <div>
              <StatusBadge tone="brown">Misi</StatusBadge>
              <StaggerGroup as="ul" className="mt-4 grid gap-3">
                {misiList.map((item, index) => (
                  <StaggerItem as="li" key={item}>
                    <HoverCard
                      as="div"
                      className="flex items-start gap-3 rounded-md border border-herbal-green/10 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-herbal-soft text-xs font-bold text-herbal-deep">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-herbal-muted">
                        {item}
                      </p>
                    </HoverCard>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <Container>
          <Reveal>
            <SectionHeading
              description="Empat tahap besar yang menjadi kerangka kerja program, dari pendataan awal hingga terintegrasi ke portal digital ini."
              eyebrow="Tahapan Program"
              title="Perjalanan Kampung Herbal Berua"
            />
          </Reveal>
          <StaggerGroup as="ol" className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            {timelineSteps.map((step, index) => (
              <StaggerItem as="li" key={step.title}>
                <HoverCard
                  as="div"
                  className="h-full rounded-md border border-herbal-green/10 bg-herbal-mist p-6 shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
                >
                  <StatusBadge tone="neutral">Tahap {index + 1}</StatusBadge>
                  <h3 className="mt-4 text-lg font-bold text-herbal-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-herbal-muted">
                    {step.description}
                  </p>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <section className="bg-herbal-cream py-12 sm:py-16">
        <Container>
          <Reveal>
            <SectionHeading
              description="Sepuluh mahasiswa KKN Universitas Hasanuddin angkatan 2023 dari enam bidang studi yang berkolaborasi menjalankan program Kampung Herbal Berua, di bawah bimbingan satu dosen pembimbing kelompok."
              eyebrow="Tim KKN"
              title="Orang-orang di balik Kampung Herbal Berua"
            />
          </Reveal>
          <Reveal className="mt-6" delay={0.05}>
            <HoverCard
              as="article"
              className="flex overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] sm:max-w-md"
            >
              <TeamMemberPhoto
                className="w-28 shrink-0 sm:w-36"
                member={programSupervisor}
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
                <StatusBadge tone="brown">{programSupervisor.role}</StatusBadge>
                <h3 className="mt-2 text-base font-bold leading-tight text-herbal-ink sm:text-lg">
                  {programSupervisor.name}
                </h3>
              </div>
            </HoverCard>
          </Reveal>
          <StaggerGroup className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <StaggerItem key={member.id}>
                <HoverCard
                  as="article"
                  className="flex h-full overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
                >
                  <TeamMemberPhoto
                    className="w-[40%] shrink-0 sm:w-[38%]"
                    member={member}
                  />
                  <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
                    <h3 className="line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:text-base">
                      {member.name}
                    </h3>
                    <StatusBadge className="mt-2" tone="green">
                      {member.studyProgram}
                    </StatusBadge>
                    <p className="mt-2 line-clamp-2 text-[0.65rem] leading-5 text-herbal-muted sm:text-xs">
                      {member.faculty} · Angkatan {member.entryYear}
                    </p>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-herbal-muted">
              Kontribusi lebih rinci dari setiap anggota tim dapat dilihat di
              halaman Tim KKN.
            </p>
            <LinkButton href="/tim" variant="secondary">
              Lihat Detail Kontribusi
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
