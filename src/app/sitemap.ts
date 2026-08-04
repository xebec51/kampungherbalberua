import type { MetadataRoute } from "next";
import { recipes } from "@/data/recipes";
import {
  getHerbaCodePlantSlugs,
  getHerbaCodeZoneSummaries,
} from "@/lib/data/herbacode";
import { getPosterPlantSlugs } from "@/lib/data/poster-plants";
import { getProductSlugs } from "@/lib/data/products";
import { getPublishedStreetSlugs } from "@/lib/data/streets";
import { absoluteUrl } from "@/lib/metadata";

const staticRoutes = [
  "/",
  "/tentang",
  "/tanaman",
  "/jalan",
  "/peta",
  "/zona-kesehatan",
  "/kinerja-rt",
  "/tim",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [herbaCodePlantSlugs, posterPlantSlugs, zones, streetSlugs, productSlugs] =
    await Promise.all([
    getHerbaCodePlantSlugs(),
    getPosterPlantSlugs(),
    getHerbaCodeZoneSummaries(),
    getPublishedStreetSlugs(),
    getProductSlugs(),
  ]);
  const plantSlugs = Array.from(
    new Set([...herbaCodePlantSlugs, ...posterPlantSlugs]),
  );

  const dynamicRoutes = [
    ...plantSlugs.map((slug) => `/tanaman/${slug}`),
    ...streetSlugs.map((slug) => `/jalan/${slug}`),
    ...zones.map((zone) => `/zona-kesehatan/${zone.slug}`),
    ...recipes
      .filter((recipe) => recipe.published)
      .map((recipe) => `/ramuan/${recipe.slug}`),
    ...productSlugs.map((slug) => `/produk/${slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    changeFrequency: "weekly",
    lastModified: now,
    priority: route === "/" ? 1 : 0.7,
    url: absoluteUrl(route),
  }));
}
