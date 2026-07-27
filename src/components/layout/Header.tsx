"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { NavigationDropdown } from "@/components/layout/NavigationDropdown";
import { NavigationLink } from "@/components/layout/NavigationLink";
import { Container } from "@/components/ui/Container";
import { mainNavigation } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const solid = !isHome || scrolled;
  const navigationTone = solid ? "solid" : "hero";

  useEffect(() => {
    if (!isHome) {
      return;
    }

    function updateScrolledState() {
      setScrolled(window.scrollY > 24);
    }

    const animationFrame = window.requestAnimationFrame(updateScrolledState);
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateScrolledState);
    };
  }, [isHome]);

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-50 transition-colors duration-300",
        isHome ? "fixed" : "sticky",
        solid
          ? "border-b border-herbal-green/40 bg-herbal-green/95 text-white shadow-[0_16px_42px_rgba(17,27,21,0.18)] backdrop-blur"
          : "border-b border-transparent bg-transparent text-white",
      )}
    >
      <Container className="relative flex min-h-20 items-center justify-between gap-4">
        <Logo tone={solid ? "solid" : "hero"} />
        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 lg:flex"
        >
          {mainNavigation.map((item) => {
            if (item.type === "group") {
              return (
                <NavigationDropdown
                  item={item}
                  key={item.label}
                  onOpenChange={(open) =>
                    setOpenDropdown(open ? item.label : null)
                  }
                  open={openDropdown === item.label}
                  tone={navigationTone}
                />
              );
            }

            return (
              <NavigationLink
                href={item.href}
                key={item.href}
                label={item.label}
                onClick={() => setOpenDropdown(null)}
                tone={navigationTone}
                variant={item.type === "cta" ? "cta" : "link"}
              />
            );
          })}
        </nav>
        <MobileNavigation tone={navigationTone} />
      </Container>
    </header>
  );
}
