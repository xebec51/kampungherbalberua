import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
