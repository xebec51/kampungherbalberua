import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { createRootMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = createRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <SkipLink />
        <Header />
        <main id="konten-utama">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
