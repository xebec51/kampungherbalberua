"use client";

import { useEffect, useId, useState } from "react";
import { mainNavigation } from "@/data/navigation";
import { NavigationLink } from "@/components/layout/NavigationLink";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

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
    <div className="md:hidden">
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-herbal-green/20 bg-white text-herbal-deep shadow-sm transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
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
          className="absolute inset-x-4 top-[76px] z-40 rounded-md border border-herbal-green/15 bg-herbal-cream p-3 shadow-lg"
          id={menuId}
        >
          <nav aria-label="Navigasi mobile" className="grid gap-1">
            {mainNavigation.map((item) => (
              <NavigationLink
                href={item.href}
                key={item.href}
                label={item.label}
                mobile
                onClick={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
