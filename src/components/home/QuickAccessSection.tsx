import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { HoverCard } from "@/components/motion/HoverCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";

const quickLinks = [
  {
    index: "01",
    title: "Tanaman TOGA",
    description: "Kenali tanaman yang dikenalkan dalam katalog Kampung Herbal Harmony.",
    href: "/tanaman",
  },
  {
    index: "02",
    title: "Zona Kesehatan",
    description: "Lihat tanaman dan manfaat sesuai zona HerbaCode.",
    href: "/zona-kesehatan",
  },
  {
    index: "03",
    title: "Peta Kampung",
    description: "Pahami pembagian zona edukasi kesehatan di wilayah kampung.",
    href: "/peta",
  },
  {
    index: "04",
    title: "Jalan Tematik",
    description: "Jelajahi sembilan jalan tematik beserta tanaman yang tercatat.",
    href: "/jalan",
  },
];

export function QuickAccessSection() {
  return (
    <section className="home-section bg-herbal-cream py-14 sm:py-16">
      <Container>
        <Reveal className="mb-7 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-herbal-brown">
            Akses Cepat
          </p>
          <h2 className="mt-3 text-2xl font-bold text-herbal-ink sm:text-3xl">
            Langsung ke Halaman yang Sering Dicari
          </h2>
        </Reveal>
        <StaggerGroup className="grid grid-cols-2 gap-2 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white/76 p-2 shadow-[var(--shadow-soft)] backdrop-blur sm:gap-3 sm:p-3 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <StaggerItem key={item.href}>
              <Link
                className="block h-full rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                href={item.href}
              >
                <HoverCard
                  as="div"
                  className="group grid h-full min-h-32 rounded-md border border-herbal-green/10 bg-white p-3.5 transition-colors duration-300 hover:border-herbal-green/25 hover:bg-herbal-mist hover:shadow-[0_14px_32px_rgba(17,27,21,0.11)] sm:min-h-40 sm:p-5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-herbal-gold text-xs font-bold text-herbal-ink sm:h-10 sm:w-10 sm:text-sm">
                    {item.index}
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-herbal-ink group-hover:text-herbal-green sm:mt-4 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-6">
                    {item.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-herbal-green group-hover:text-herbal-deep sm:mt-5 sm:gap-2 sm:text-sm">
                    Buka halaman
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 4.5 12.5 10 7 15.5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                </HoverCard>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
