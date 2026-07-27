"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { mainNavigation } from "@/data/navigation";
import { NavigationLink } from "@/components/layout/NavigationLink";
import { hasActiveChild } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MobileNavigationProps = {
  tone?: "default" | "hero" | "solid";
};

export function MobileNavigation({ tone = "default" }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-md border shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2",
          tone === "hero"
            ? "border-white/[0.35] bg-white/[0.14] text-white backdrop-blur hover:bg-white/[0.22] focus-visible:outline-white"
            : tone === "solid"
              ? "border-white/[0.25] bg-white text-herbal-deep hover:bg-herbal-soft focus-visible:outline-white"
              : "border-herbal-green/20 bg-white text-herbal-deep hover:bg-herbal-soft focus-visible:outline-herbal-brown",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
        <span
          aria-hidden="true"
          className={cn(
            "relative block h-0.5 w-5 rounded-full bg-current transition before:absolute before:left-0 before:h-0.5 before:w-5 before:rounded-full before:bg-current before:transition after:absolute after:left-0 after:h-0.5 after:w-5 after:rounded-full after:bg-current after:transition",
            open
              ? "rotate-45 before:top-0 before:rotate-90 after:top-0 after:opacity-0"
              : "before:-top-1.5 after:top-1.5",
          )}
        />
      </button>

      {open ? (
        <div
          className="absolute inset-x-4 top-[76px] z-40 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-md border border-herbal-green/15 bg-herbal-cream p-3 shadow-lg"
          id={menuId}
        >
          <nav aria-label="Navigasi mobile" className="grid gap-1">
            {mainNavigation.map((item) => {
              if (item.type === "group") {
                const active = hasActiveChild(pathname, item.children);

                return (
                  <section
                    className="rounded-md border border-herbal-green/10 bg-white/70 p-2"
                    key={item.label}
                  >
                    <p
                      className={cn(
                        "px-2 pb-1 pt-1 text-xs font-bold uppercase tracking-[0.14em]",
                        active ? "text-herbal-green" : "text-herbal-muted",
                      )}
                    >
                      {item.label}
                    </p>
                    <div className="grid gap-1">
                      {item.children.map((child) => (
                        <NavigationLink
                          href={child.href}
                          key={child.href}
                          label={child.label}
                          mobile
                          nested
                          onClick={() => setOpen(false)}
                        />
                      ))}
                    </div>
                  </section>
                );
              }

              return (
                <NavigationLink
                  href={item.href}
                  key={item.href}
                  label={item.label}
                  mobile
                  onClick={() => setOpen(false)}
                  variant={item.type === "cta" ? "cta" : "link"}
                />
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
