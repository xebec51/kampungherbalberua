import Link from "next/link";
import { Container } from "@/components/ui/Container";

const quickLinks = [
  {
    title: "Tanaman TOGA",
    description: "Katalog tanaman obat keluarga dengan status verifikasi.",
    href: "/tanaman",
  },
  {
    title: "Ramuan Sehat",
    description: "Edukasi pemanfaatan tradisional yang menunggu validasi.",
    href: "/ramuan",
  },
  {
    title: "Peta Kampung",
    description: "Ruang integrasi denah dan pemetaan hasil tim PWK.",
    href: "/peta",
  },
  {
    title: "Produk Warga",
    description: "Katalog awal produk masyarakat yang akan didata bertahap.",
    href: "/produk",
  },
];

export function QuickAccessSection() {
  return (
    <section className="bg-white py-12">
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              className="group rounded-md border border-herbal-green/10 bg-herbal-cream p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-herbal-green/30 hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={item.href}
              key={item.href}
            >
              <h2 className="text-lg font-bold text-herbal-ink group-hover:text-herbal-green">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-herbal-muted">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
