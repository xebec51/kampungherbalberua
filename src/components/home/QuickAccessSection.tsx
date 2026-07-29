import Link from "next/link";
import { Container } from "@/components/ui/Container";

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
    title: "Sumber Gambar",
    description: "Baca atribusi media yang digunakan pada website.",
    href: "/sumber-gambar",
  },
];

export function QuickAccessSection() {
  return (
    <section className="relative z-10 -mt-16 bg-transparent pb-16">
      <Container>
        <div className="grid gap-3 rounded-md border border-white/[0.45] bg-white/72 p-3 shadow-[0_20px_54px_rgba(17,27,21,0.16)] backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              className="group grid min-h-40 rounded-md border border-herbal-green/10 bg-white/94 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-herbal-green/25 hover:bg-herbal-mist hover:shadow-[0_14px_32px_rgba(17,27,21,0.11)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={item.href}
              key={item.href}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f7d774] text-sm font-extrabold text-[#111b15]">
                {item.index}
              </span>
              <h2 className="mt-4 text-lg font-extrabold text-herbal-ink group-hover:text-herbal-green">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-herbal-muted">
                {item.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-herbal-green group-hover:text-herbal-deep">
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
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
