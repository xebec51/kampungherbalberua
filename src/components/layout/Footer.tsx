import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { PartnerLogos } from "@/components/ui/PartnerLogos";
import { footerMainNavigation, footerNavigation } from "@/data/navigation";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="brand-pattern overflow-hidden bg-herbal-green text-white">
      <Container className="relative grid gap-8 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo tone="solid" />
          <p className="mt-5 max-w-md text-sm leading-6 text-white/78">
            Portal informasi digital Kampung Herbal RT 009/RW 006 Kelurahan
            Berua, Kecamatan Biringkanaya, Kota Makassar.
          </p>
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-white">Kolaborasi</h2>
            <PartnerLogos
              className="mt-3"
              compact
              itemClassName="bg-white"
            />
          </div>
        </div>
        <nav aria-label="Navigasi footer utama">
          <h2 className="text-sm font-semibold text-white">Menu Utama</h2>
          <ul className="mt-4 grid gap-2 text-sm text-white/76">
            {footerMainNavigation.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-white hover:underline" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Navigasi footer tambahan">
          <h2 className="text-sm font-semibold text-white">Informasi</h2>
          <ul className="mt-4 grid gap-2 text-sm text-white/76">
            {footerNavigation.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-white hover:underline" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="text-white/52 hover:text-white hover:underline" href="/admin">
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
      <div className="relative border-t border-white/12">
        <Container className="flex flex-col gap-2 py-4 text-xs text-white/64 sm:flex-row sm:items-center sm:justify-between">
          <p>Sumber tanaman dan zona: HerbaCode Kampung Herbal Harmony.</p>
          <p>&copy; {year} Kampung Herbal Harmony Berua.</p>
        </Container>
      </div>
    </footer>
  );
}
