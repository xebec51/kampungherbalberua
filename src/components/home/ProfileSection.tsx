import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Container } from "@/components/ui/Container";
import { PartnerLogos } from "@/components/ui/PartnerLogos";
import { SectionHeading } from "@/components/ui/SectionHeading";

const profilePoints = [
  {
    label: "Wilayah",
    value: "RT 009/RW 006, Kelurahan Berua",
  },
  {
    label: "Program",
    value: "Kampung Herbal Harmony",
  },
  {
    label: "Fokus",
    value: "Tanaman & zona kesehatan",
  },
  {
    label: "Sifat",
    value: "Edukasi umum, bukan resep medis",
  },
];

export function ProfileSection() {
  return (
    <section className="home-section bg-white py-16 sm:py-20">
      <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <Reveal>
            <SectionHeading
              description="Portal edukasi digital untuk mengenal tanaman, zona kesehatan, peta kampung, dan produk warga Kampung Herbal Berua."
              eyebrow="Profil Singkat"
              title="Kampung Herbal Berua"
            />
          </Reveal>
          <div className="mt-6 rounded-[var(--radius-card)] border border-herbal-green/15 bg-herbal-soft p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-herbal-brown">
              Kolaborasi Program
            </h3>
            <p className="mt-2 text-sm leading-6 text-herbal-muted">
              KKN Universitas Hasanuddin bersama Pemerintah Kota Makassar.
            </p>
            <PartnerLogos className="mt-4" />
          </div>
        </div>
        <StaggerGroup as="dl" className="grid grid-cols-2 gap-3">
          {profilePoints.map((item) => (
            <StaggerItem key={item.label}>
              <div className="rounded-[var(--radius-card)] border border-herbal-green/12 bg-herbal-soft/40 p-4 sm:p-5">
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm font-semibold leading-6 text-herbal-ink">
                  {item.value}
                </dd>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
