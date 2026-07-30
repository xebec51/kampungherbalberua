import type { Metadata } from "next";
import { communityMapConfig } from "@/data/map-config";

export const siteName = "Kampung Herbal Harmony Berua";
export const alternateSiteName = "Kampung Herbal Berua";

export const siteDescription =
  "Portal resmi Kampung Herbal Harmony Berua RT 009/RW 006 Kelurahan Berua, Makassar, untuk katalog tanaman TOGA, zona kesehatan HerbaCode, jalan tematik, peta kampung, kegiatan, dan produk warga.";

const siteKeywords = [
  "Kampung Herbal Harmony Berua",
  "Kampung Herbal Berua",
  "Tanaman TOGA",
  "HerbaCode",
  "Zona kesehatan herbal",
  "Jalan tematik Kampung Herbal",
  "Kelurahan Berua",
  "Kecamatan Biringkanaya",
  "Kota Makassar",
];

const socialImage = "/brand/logo/kampung-herbal-wide-main.png";

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
    alternates: {
      canonical: "/",
    },
    appleWebApp: {
      capable: true,
      title: siteName,
    },
    authors: [{ name: "KKN Kampung Herbal Harmony Berua" }],
    category: "education",
    creator: "KKN Kampung Herbal Harmony Berua",
    keywords: siteKeywords,
    manifest: "/manifest.webmanifest",
    icons: {
      apple: [
        { url: "/icons/leaf.svg" },
        { sizes: "180x180", type: "image/png", url: "/icons/apple-touch-icon.png" },
      ],
      icon: [
        { sizes: "any", url: "/favicon.ico" },
        { url: "/icons/leaf.svg", type: "image/svg+xml" },
        { sizes: "48x48", type: "image/png", url: "/icons/favicon-48x48.png" },
        { sizes: "96x96", type: "image/png", url: "/icons/favicon-96x96.png" },
      ],
      shortcut: "/favicon.ico",
    },
    openGraph: {
      description: siteDescription,
      images: [
        {
          alt: "Logo Kampung Herbal Harmony Berua",
          height: 630,
          url: socialImage,
          width: 1200,
        },
      ],
      locale: "id_ID",
      siteName,
      title: siteName,
      type: "website",
      url: "/",
    },
    publisher: "Kampung Herbal Harmony Berua",
    robots: {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      index: true,
    },
    twitter: {
      card: "summary_large_image",
      description: siteDescription,
      images: [socialImage],
      title: siteName,
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
    title: title === siteName ? { absolute: siteName } : title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      description,
      images: [
        {
          alt: openGraphTitle,
          height: 630,
          url: socialImage,
          width: 1200,
        },
      ],
      locale: "id_ID",
      siteName,
      title: openGraphTitle,
      type: "website",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      description,
      images: [socialImage],
      title: openGraphTitle,
    },
  };
}

export function createRootStructuredData() {
  const siteUrl = getSiteUrl();
  const logoUrl = absoluteUrl(socialImage);

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      alternateName: alternateSiteName,
      description: siteDescription,
      inLanguage: "id-ID",
      name: siteName,
      potentialAction: {
        "@type": "SearchAction",
        "query-input": "required name=search_term_string",
        target: `${siteUrl}/tanaman?search={search_term_string}`,
      },
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      url: siteUrl,
    },
    {
      "@context": "https://schema.org",
      "@id": `${siteUrl}/#organization`,
      "@type": "Organization",
      address: {
        "@type": "PostalAddress",
        addressCountry: "ID",
        addressLocality: "Makassar",
        addressRegion: "Sulawesi Selatan",
        streetAddress: communityMapConfig.regionLines.join(", "),
      },
      alternateName: alternateSiteName,
      description: siteDescription,
      hasMap: communityMapConfig.googleMapsUrl,
      logo: logoUrl,
      name: siteName,
      url: siteUrl,
    },
  ];
}
