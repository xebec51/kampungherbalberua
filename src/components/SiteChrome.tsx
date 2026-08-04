"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type SiteChromeProps = {
  children: ReactNode;
  footer: ReactNode;
  header: ReactNode;
  skipLink: ReactNode;
  splash: ReactNode;
  structuredData: ReactNode;
};

/**
 * Admin routes get their own shell (AdminSidebar, no public nav/footer) --
 * this is the single switch point so src/app/layout.tsx stays one root
 * layout instead of duplicating <html>/<body>/fonts across an admin-only
 * layout tree.
 */
export function SiteChrome({
  children,
  footer,
  header,
  skipLink,
  splash,
  structuredData,
}: SiteChromeProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      {splash}
      {skipLink}
      {header}
      <main className="scroll-mt-24 focus:outline-none" id="konten-utama" tabIndex={-1}>
        {children}
      </main>
      {footer}
      {structuredData}
    </>
  );
}
