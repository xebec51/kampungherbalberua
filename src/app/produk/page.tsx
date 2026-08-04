import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCatalog } from "@/components/products/ProductCatalog";
import { PageHero } from "@/components/ui/PageHero";
import { getProducts } from "@/lib/data/products";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Produk Warga",
  description:
    "Katalog produk warga Kampung Herbal Harmony Berua dengan pemesanan melalui WhatsApp.",
  path: "/produk",
});

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <PageHero
      className="py-6 sm:py-7 lg:py-8"
      eyebrow="Produk Warga"
      title="Katalog Produk Kampung Herbal"
    >
      <Suspense
        fallback={
          <p className="text-sm text-herbal-muted">Memuat katalog produk.</p>
        }
      >
        <ProductCatalog products={products} />
      </Suspense>
    </PageHero>
  );
}
