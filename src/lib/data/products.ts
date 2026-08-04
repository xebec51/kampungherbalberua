import { unstable_cache } from "next/cache";
import { cache } from "react";
import { products as fallbackProducts } from "@/data/products";
import { getPublicMediaUrl } from "@/lib/data/media-mapper";
import {
  createSupabasePublicClient,
  getSupabaseConfig,
} from "@/lib/supabase/config";
import type { Product } from "@/types";

type ProductRow = {
  availability: Product["availability"];
  benefits: string[];
  category: string;
  description: string;
  featured: boolean;
  id: string;
  image_path: string | null;
  name: string;
  price: number | null;
  producer_name: string;
  slug: string;
  unit: string | null;
  whatsapp_number: string | null;
};

function mapRowToProduct(row: ProductRow): Product {
  return {
    availability: row.availability,
    benefits: row.benefits,
    category: row.category,
    description: row.description,
    featured: row.featured,
    id: row.id,
    image: row.image_path ?? "",
    name: row.name,
    price: row.price,
    producerName: row.producer_name,
    slug: row.slug,
    unit: row.unit,
    whatsappNumber: row.whatsapp_number,
  };
}

// Reads media via a plain public_bucket/public_path lookup on content_media_slots
// (createSupabasePublicClient, not getContentMediaSlotMap) rather than the
// cookie-aware helper in src/lib/data/media.ts -- this whole module has to
// stay cookie-free since /produk/[slug] statically generates via
// generateStaticParams, which runs at build time with no request/cookies at
// all (not just no unstable_cache support).
async function fetchProductCoverUrls(
  client: ReturnType<typeof createSupabasePublicClient>,
  productIds: string[],
): Promise<Map<string, string>> {
  if (productIds.length === 0) {
    return new Map();
  }

  const { data, error } = await client
    .from("content_media_slots")
    .select("content_key, media_assets(public_bucket, public_path)")
    .eq("content_type", "product")
    .in("content_key", productIds)
    .eq("is_primary", true);

  const urlByProductId = new Map<string, string>();

  if (error || !data) {
    return urlByProductId;
  }

  for (const row of data as Array<{
    content_key: string;
    media_assets: { public_bucket: string | null; public_path: string | null } | null;
  }>) {
    const url = row.media_assets ? getPublicMediaUrl(row.media_assets) : null;

    if (url) {
      urlByProductId.set(row.content_key, url);
    }
  }

  return urlByProductId;
}

async function fetchProductCatalogFromDatabase(): Promise<Product[]> {
  const config = getSupabaseConfig();

  if (!config) {
    return fallbackProducts;
  }

  const client = createSupabasePublicClient(config);

  const { data, error } = await client
    .from("products")
    .select(
      "id,slug,name,category,description,benefits,price,unit,image_path,producer_name,whatsapp_number,availability,featured",
    )
    .order("name", { ascending: true });

  if (error || !data || data.length === 0) {
    return fallbackProducts;
  }

  const products = data.map(mapRowToProduct);
  const coverUrlByProductId = await fetchProductCoverUrls(
    client,
    products.map((product) => product.id),
  );

  return products.map((product) => {
    const coverUrl = coverUrlByProductId.get(product.id);
    return coverUrl ? { ...product, image: coverUrl } : product;
  });
}

const getCachedProductCatalog = unstable_cache(
  fetchProductCatalogFromDatabase,
  ["products-catalog"],
  { revalidate: 300 },
);

export const getProducts = cache(getCachedProductCatalog);

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
});

export const getFeaturedProducts = cache(async () => {
  const products = await getProducts();
  return products.filter((product) => product.featured);
});

export const getProductSlugs = cache(async () => {
  const products = await getProducts();
  return products.map((product) => product.slug);
});
