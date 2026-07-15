import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kampung Herbal Berua",
  description:
    "Portal digital Kampung Herbal RT 009/RW 006 Kelurahan Berua.",
};

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
