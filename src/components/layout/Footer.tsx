import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { PartnerLogos } from "@/components/ui/PartnerLogos";
import { footerMainNavigation, footerNavigation } from "@/data/navigation";

export function Footer() {
  return (
    <footer className="border-t border-herbal-green/10 bg-white">
      <Container className="grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-6 text-herbal-muted">
            Portal informasi digital Kampung Herbal RT 009/RW 006 Kelurahan
            Berua, Kecamatan Biringkanaya, Kota Makassar.
          </p>
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-herbal-ink">Kolaborasi</h2>
            <PartnerLogos
              className="mt-3"
              compact
              itemClassName="bg-herbal-cream"
            />
          </div>
        </div>
        <nav aria-label="Navigasi footer utama">
          <h2 className="text-sm font-semibold text-herbal-ink">Menu Utama</h2>
          <ul className="mt-4 grid gap-2 text-sm text-herbal-muted">
            {footerMainNavigation.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-herbal-green hover:underline" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Navigasi footer tambahan">
          <h2 className="text-sm font-semibold text-herbal-ink">Informasi</h2>
          <ul className="mt-4 grid gap-2 text-sm text-herbal-muted">
            {footerNavigation.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-herbal-green hover:underline" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <div className="border-t border-herbal-green/10">
        <Container className="flex flex-col gap-2 py-4 text-xs text-herbal-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Sumber tanaman dan zona: HerbaCode Kampung Herbal Harmony.</p>
          <p>Kampung Herbal Berua</p>
        </Container>
      </div>
    </footer>
  );
}
