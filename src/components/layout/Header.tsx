import { Logo } from "@/components/layout/Logo";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { NavigationLink } from "@/components/layout/NavigationLink";
import { Container } from "@/components/ui/Container";
import { mainNavigation } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-herbal-green/10 bg-white/95 shadow-[0_10px_30px_rgba(17,27,21,0.07)] backdrop-blur">
      <Container className="relative flex min-h-20 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {mainNavigation.map((item) => (
            <NavigationLink href={item.href} key={item.href} label={item.label} />
          ))}
        </nav>
        <MobileNavigation />
      </Container>
    </header>
  );
}
