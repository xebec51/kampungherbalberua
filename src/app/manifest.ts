import type { MetadataRoute } from "next";
import { siteDescription, siteName } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#F5F1DD",
    description: siteDescription,
    display: "standalone",
    icons: [
      {
        sizes: "48x48",
        src: "/icons/favicon-48x48.png",
        type: "image/png",
      },
      {
        sizes: "96x96",
        src: "/icons/favicon-96x96.png",
        type: "image/png",
      },
      {
        sizes: "192x192",
        src: "/icons/icon-192x192.png",
        type: "image/png",
      },
    ],
    lang: "id",
    name: siteName,
    short_name: "Kampung Herbal",
    start_url: "/",
    theme_color: "#0C3E22",
  };
}
