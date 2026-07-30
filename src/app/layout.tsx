import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { createRootMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = createRootMetadata();

const poppins = localFont({
  display: "swap",
  src: [
    {
      path: "../assets/fonts/poppins/Poppins-Light.ttf",
      style: "normal",
      weight: "300",
    },
    {
      path: "../assets/fonts/poppins/Poppins-Regular.ttf",
      style: "normal",
      weight: "400",
    },
    {
      path: "../assets/fonts/poppins/Poppins-Medium.ttf",
      style: "normal",
      weight: "500",
    },
    {
      path: "../assets/fonts/poppins/Poppins-Bold.ttf",
      style: "normal",
      weight: "700",
    },
  ],
  variable: "--font-poppins",
});

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
    <html className={poppins.variable} data-scroll-behavior="smooth" lang="id">
      <body>
        <SkipLink />
        <Header />
        <main id="konten-utama">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
