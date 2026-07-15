import type { MetadataRoute } from "next";
import { plants } from "@/data/plants";
import { products } from "@/data/products";
import { recipes } from "@/data/recipes";
import { absoluteUrl } from "@/lib/metadata";

const staticRoutes = [
  "/",
  "/tentang",
  "/tanaman",
  "/ramuan",
  "/peta",
  "/wisata",
  "/produk",
  "/kegiatan",
  "/kinerja-rt",
  "/kotak-saran",
  "/tim",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const dynamicRoutes = [
    ...plants.filter((plant) => plant.published).map((plant) => `/tanaman/${plant.slug}`),
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
