import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { HoverCard } from "@/components/motion/HoverCard";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[82svh] items-center overflow-hidden bg-herbal-deep text-white sm:min-h-[88svh]">
      <Image
        alt="Lorong Kampung Herbal Berua dengan pot tanaman obat keluarga di pagi hari"
        className="absolute inset-0 -z-30 h-full w-full object-cover"
        fetchPriority="high"
        fill
        preload
        quality={72}
        sizes="100vw"
        src="/images/home/kampung-herbal-hero.webp"
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(8,39,25,0.88)_0%,rgba(8,39,25,0.72)_46%,rgba(8,39,25,0.42)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(8,39,25,0.48)_0%,rgba(8,39,25,0.12)_45%,rgba(8,39,25,0.94)_100%)]" />
      <div className="absolute right-8 top-28 -z-10 hidden h-56 w-56 rounded-full border border-white/10 sm:block" />
      <div className="absolute right-24 top-44 -z-10 hidden h-28 w-28 rounded-full border border-herbal-gold/25 sm:block motion-safe:animate-[leaf-drift_7s_ease-in-out_infinite]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-herbal-ink to-transparent" />

      <Container className="py-24 sm:py-28 lg:py-32">
        <StaggerGroup amount={0.4} className="max-w-3xl" staggerDelay={0.12}>
          <StaggerItem>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-herbal-gold">
              RT 009/RW 006 Kelurahan Berua
            </p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-4 max-w-4xl break-words text-3xl font-bold leading-tight tracking-normal text-white drop-shadow-[0_5px_24px_rgba(0,0,0,0.72)] sm:text-5xl lg:text-6xl">
              Kampung Herbal Harmony Berua
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-6 max-w-2xl break-words text-base leading-8 text-white/88 drop-shadow-[0_3px_16px_rgba(0,0,0,0.5)] sm:text-lg">
              Kampung Herbal Harmony merupakan kawasan permukiman sehat,
              hijau, dan produktif yang mengintegrasikan tanaman herbal, zero
              waste, dan urban farming sebagai gaya hidup masyarakat
              perkotaan yang berkelanjutan.
            </p>
          </StaggerItem>
          <StaggerItem
            as="div"
            className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <Link
              className="block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-herbal-gold"
              href="/tanaman"
            >
              <HoverCard
                as="div"
                className="flex min-h-14 items-center justify-center rounded-md bg-herbal-gold px-7 py-3 text-base font-bold !text-herbal-ink shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition-colors hover:bg-white"
              >
                Jelajahi Tanaman
              </HoverCard>
            </Link>
            <Link
              className="block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href="/jalan"
            >
              <HoverCard
                as="div"
                className="flex min-h-14 items-center justify-center rounded-md border border-white/[0.55] bg-white/[0.14] px-7 py-3 text-base font-bold text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur transition-colors hover:bg-white hover:!text-[#111b15]"
              >
                Lihat Jalan Tematik
              </HoverCard>
            </Link>
          </StaggerItem>
        </StaggerGroup>
      </Container>
    </section>
  );
}
