import Link from "next/link";
import { Container } from "@/components/ui/Container";

const quickLinks = [
  {
    index: "01",
    title: "Tanaman TOGA",
    description: "Katalog tanaman obat keluarga dengan status verifikasi.",
    href: "/tanaman",
  },
  {
    index: "02",
    title: "Ramuan Sehat",
    description: "Edukasi pemanfaatan tradisional yang menunggu validasi.",
    href: "/ramuan",
  },
  {
    index: "03",
    title: "Peta Kampung",
    description: "Ruang integrasi denah dan pemetaan hasil tim PWK.",
    href: "/peta",
  },
  {
    index: "04",
    title: "Produk Warga",
    description: "Katalog awal produk masyarakat yang akan didata bertahap.",
    href: "/produk",
  },
];

export function QuickAccessSection() {
  return (
    <section className="relative z-10 -mt-16 bg-transparent pb-16">
      <Container>
        <div className="grid gap-3 rounded-md border border-white/[0.45] bg-white/70 p-3 shadow-[0_24px_70px_rgba(17,27,21,0.18)] backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              className="group grid min-h-44 rounded-md border border-herbal-green/10 bg-white p-5 transition hover:-translate-y-1 hover:border-herbal-green/25 hover:bg-herbal-mist hover:shadow-[0_18px_42px_rgba(17,27,21,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={item.href}
              key={item.href}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f7d774] text-sm font-extrabold text-[#111b15]">
                {item.index}
              </span>
              <h2 className="mt-4 text-xl font-bold text-herbal-ink group-hover:text-herbal-green">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-herbal-muted">
                {item.description}
              </p>
              <span className="mt-5 inline-flex text-sm font-bold text-herbal-green group-hover:text-herbal-deep">
                Buka halaman
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
