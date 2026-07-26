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
    <section className="relative z-10 -mt-14 bg-transparent pb-16">
      <Container>
        <div className="grid gap-px overflow-hidden rounded-md border border-herbal-green/15 bg-herbal-green/15 shadow-[0_24px_70px_rgba(17,27,21,0.16)] sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              className="group bg-white p-6 transition hover:bg-herbal-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={item.href}
              key={item.href}
            >
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-herbal-brown">
                {item.index}
              </span>
              <h2 className="mt-4 text-xl font-bold text-herbal-ink group-hover:text-herbal-green">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-herbal-muted">
                {item.description}
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-herbal-green group-hover:text-herbal-deep">
                Buka halaman
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
