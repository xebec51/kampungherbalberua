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
import {
  communityLeader,
  getDisplayOrderedTeamMembers,
  programSupervisor,
} from "@/data/team";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Tentang",
  description:
    "Profil singkat Kampung Herbal RT 009/RW 006 Kelurahan Berua, Kecamatan Biringkanaya, Kota Makassar.",
  path: "/tentang",
});

const misiList = [
  "Menumbuhkan budaya menanam dan merawat TOGA di pekarangan warga.",
  "Memberi edukasi kesehatan berbasis tanaman herbal yang aman dipakai.",
  "Mendata tanaman, produk, dan kegiatan warga dalam satu portal digital.",
  "Membantu warga memasarkan produk herbal buatan sendiri.",
  "Mengajak warga ikut aktif merawat dan mengembangkan kampung herbal.",
];

const teamMembers = getDisplayOrderedTeamMembers();
const programLeaders = [programSupervisor, communityLeader];

export default function AboutPage() {
  return (
    <>
      <section className="bg-herbal-cream py-12 sm:py-16">
        <Container>
          <Reveal>
            <SectionHeading
              description="Portal edukasi tanaman obat keluarga (TOGA) di RT 009/RW 006, Kelurahan Berua, Kecamatan Biringkanaya, Kota Makassar."
              eyebrow="Tentang"
              title="Kampung Herbal Berua"
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
          <Reveal className="mt-6" delay={0.1}>
            <HoverCard
              as="article"
              className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
            >
              <p className="text-sm leading-7 text-herbal-muted">
                Kampung Herbal Harmony adalah program pengenalan tanaman obat
                keluarga (TOGA) yang dijalankan 10 mahasiswa KKN Universitas
                Hasanuddin bersama warga RT 009/RW 006. Website ini memuat
                katalog tanaman, zona kesehatan, peta, dan kegiatan warga.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/tim" variant="secondary">
                  Lihat Tim KKN
                </LinkButton>
                <LinkButton href="/kegiatan" variant="ghost">
                  Lihat Kegiatan
                </LinkButton>
              </div>
            </HoverCard>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <Container>
          <Reveal>
            <SectionHeading
              description="Visi dan misi program Kampung Herbal Berua."
              eyebrow="Visi & Misi"
              title="Arah yang Dituju"
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
                  herbal yang sehat dan mandiri secara pengetahuan.
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

      <section className="bg-herbal-cream py-12 sm:py-16">
        <Container>
          <Reveal>
            <SectionHeading
              description="Sepuluh mahasiswa KKN Unhas dari enam bidang studi, didampingi dosen pembimbing dan Ketua RT."
              eyebrow="Tim KKN"
              title="Orang-orang di Balik Kampung Herbal Berua"
            />
          </Reveal>

          <Reveal className="mt-6" delay={0.05}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
              Pembina Program
            </p>
          </Reveal>
          <StaggerGroup className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {programLeaders.map((leader) => (
              <StaggerItem key={leader.name}>
                <HoverCard
                  as="article"
                  className="flex h-full overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
                >
                  <TeamMemberPhoto
                    className="w-28 shrink-0 sm:w-32"
                    member={leader}
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
                    <StatusBadge tone="brown">{leader.role}</StatusBadge>
                    <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:text-base">
                      {leader.name}
                    </h3>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal className="mt-8" delay={0.05}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
              Mahasiswa KKN
            </p>
          </Reveal>
          <StaggerGroup className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
