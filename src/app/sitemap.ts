import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { recipes } from "@/data/recipes";
import { getHealthZoneSlugs } from "@/lib/data/health-zones";
import { getPlantSlugs } from "@/lib/data/plants";
import { getPosterPlantSlugs } from "@/lib/data/poster-plants";
import { absoluteUrl } from "@/lib/metadata";

const staticRoutes = [
  "/",
  "/tentang",
  "/tanaman",
  "/ramuan",
  "/peta",
  "/zona-kesehatan",
  "/wisata",
  "/produk",
  "/kegiatan",
  "/kinerja-rt",
  "/kotak-saran",
  "/tim",
  "/sumber-gambar",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const plantSlugs = await getPlantSlugs();
  const posterPlantSlugs = await getPosterPlantSlugs();
  const zoneSlugs = await getHealthZoneSlugs();
  const allPlantSlugs = Array.from(new Set([...plantSlugs, ...posterPlantSlugs]));

  const dynamicRoutes = [
    ...allPlantSlugs.map((slug) => `/tanaman/${slug}`),
    ...zoneSlugs.map((slug) => `/zona-kesehatan/${slug}`),
    ...recipes
      .filter((recipe) => recipe.published)
      .map((recipe) => `/ramuan/${recipe.slug}`),
    ...products.map((product) => `/produk/${product.slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    changeFrequency: "weekly",
    lastModified: now,
    priority: route === "/" ? 1 : 0.7,
    url: absoluteUrl(route),
  }));
}
