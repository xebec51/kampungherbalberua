import type { Metadata } from "next";

export const siteName = "Kampung Herbal Berua";

export const siteDescription =
  "Portal informasi digital Kampung Herbal RT 009/RW 006 Kelurahan Berua yang menghubungkan pengetahuan tanaman obat, ramuan sehat, potensi wilayah, dan produk masyarakat.";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function absoluteUrl(path: string) {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

type PageMetadataInput = {
  title: string;
  description: string;
  path?: string;
};

export function createRootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    keywords: [
      "Kampung Herbal Berua",
      "Tanaman TOGA",
      "Ramuan tradisional",
      "Kelurahan Berua",
      "Kota Makassar",
    ],
    icons: {
      apple: "/icons/leaf.svg",
      icon: "/icons/leaf.svg",
      shortcut: "/icons/leaf.svg",
    },
    openGraph: {
      description: siteDescription,
      locale: "id_ID",
      siteName,
      title: siteName,
      type: "website",
      url: "/",
    },
  };
}

export function createPageMetadata({
  description,
  path = "/",
  title,
}: PageMetadataInput): Metadata {
  const openGraphTitle = title === siteName ? title : `${title} | ${siteName}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      description,
      locale: "id_ID",
      siteName,
      title: openGraphTitle,
      type: "website",
      url: path,
    },
  };
}
