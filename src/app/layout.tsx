import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { createRootMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = createRootMetadata();

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="id">
      <body>
        <SkipLink />
        <Header />
        <main id="konten-utama">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
