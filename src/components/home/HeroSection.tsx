import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const heroStats = [
  {
    label: "Wilayah Program",
    value: "RT 009/RW 006",
  },
  {
    label: "Fokus Edukasi",
    value: "Tanaman TOGA",
  },
  {
    label: "Identitas QR",
    value: "Zona Permanen",
  },
];

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-herbal-deep text-white">
      <Image
        alt="Lorong Kampung Herbal Berua dengan pot tanaman obat keluarga di pagi hari"
        className="absolute inset-0 -z-30 h-full w-full object-cover"
        fill
        priority
        sizes="100vw"
        src="/images/home/kampung-herbal-hero.png"
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(8,20,13,0.54)_0%,rgba(8,20,13,0.68)_46%,rgba(8,20,13,0.9)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-herbal-ink/95 to-transparent" />

      <Container className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <StatusBadge
            className="border-white/25 bg-white/15 text-white shadow-sm backdrop-blur"
            tone="green"
          >
            RT 009/RW 006 Kelurahan Berua
          </StatusBadge>
          <h1 className="mt-6 max-w-5xl break-words text-4xl font-bold tracking-normal text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-7xl">
            Mengenal Tanaman, Merawat Kesehatan, Memberdayakan Warga
          </h1>
          <p className="mt-6 max-w-3xl break-words text-base leading-8 text-white/90 drop-shadow sm:text-xl">
            Portal informasi digital Kampung Herbal Berua yang menghubungkan
            pengetahuan tanaman obat keluarga, zona kesehatan, potensi wilayah,
            produk masyarakat, dan aspirasi warga.
          </p>
          <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
            <LinkButton
              className="bg-white text-herbal-deep hover:bg-herbal-soft"
              href="/tanaman"
            >
              Jelajahi Tanaman
            </LinkButton>
            <LinkButton
              className="border-white/45 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white hover:text-herbal-deep"
              href="/peta"
              variant="secondary"
            >
              Lihat Peta Kampung
            </LinkButton>
          </div>

          <dl className="mt-12 grid w-full max-w-4xl gap-px overflow-hidden rounded-md border border-white/20 bg-white/15 shadow-2xl backdrop-blur sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                className="bg-herbal-ink/35 px-5 py-4"
                key={item.label}
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                  {item.label}
                </dt>
                <dd className="mt-2 text-lg font-bold text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
