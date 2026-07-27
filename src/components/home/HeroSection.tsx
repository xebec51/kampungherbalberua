import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

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
    <section className="relative isolate flex min-h-svh items-center overflow-hidden bg-herbal-deep text-white">
      <Image
        alt="Lorong Kampung Herbal Berua dengan pot tanaman obat keluarga di pagi hari"
        className="absolute inset-0 -z-30 h-full w-full object-cover"
        fill
        priority
        sizes="100vw"
        src="/images/home/kampung-herbal-hero.png"
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(8,20,13,0.5)_0%,rgba(8,20,13,0.72)_48%,rgba(8,20,13,0.94)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,rgba(198,115,60,0.16),transparent_34rem)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-herbal-ink to-transparent" />

      <Container className="py-16 sm:py-24 lg:py-28">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="inline-flex rounded-full border border-white/[0.35] bg-white/[0.18] px-5 py-2 text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur">
            RT 009/RW 006 Kelurahan Berua
          </span>
          <h1 className="mt-6 max-w-4xl break-words text-3xl font-extrabold leading-tight tracking-normal text-white drop-shadow-[0_5px_24px_rgba(0,0,0,0.82)] sm:text-5xl lg:text-6xl">
            Mengenal Tanaman, Merawat Kesehatan, Memberdayakan Warga
          </h1>
          <p className="mt-6 max-w-3xl break-words text-base leading-8 text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.58)] sm:text-xl">
            Portal informasi digital Kampung Herbal Berua yang menghubungkan
            pengetahuan tanaman obat keluarga, zona kesehatan, potensi wilayah,
            produk masyarakat, dan aspirasi warga.
          </p>
          <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              className="inline-flex min-h-14 items-center justify-center rounded-md bg-[#f7d774] px-7 py-3 text-base font-extrabold !text-[#111b15] shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f7d774]"
              href="/tanaman"
            >
              Jelajahi Tanaman TOGA
            </Link>
            <Link
              className="inline-flex min-h-14 items-center justify-center rounded-md border border-white/[0.55] bg-white/[0.14] px-7 py-3 text-base font-bold text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur transition hover:bg-white hover:!text-[#111b15] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href="/peta"
            >
              Lihat Peta Kampung
            </Link>
          </div>

          <dl className="mt-12 grid w-full max-w-4xl gap-px overflow-hidden rounded-md border border-white/20 bg-white/[0.18] shadow-2xl backdrop-blur sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                className="bg-herbal-ink/45 px-5 py-4"
                key={item.label}
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
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
