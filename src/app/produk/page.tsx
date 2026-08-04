import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCatalog } from "@/components/products/ProductCatalog";
import { Container } from "@/components/ui/Container";
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
    <section className="brand-pattern border-b border-herbal-green/10 bg-herbal-cream py-6 text-herbal-ink sm:py-7 lg:py-8">
      <Container>
        <Suspense
          fallback={
            <p className="text-sm text-herbal-muted">Memuat katalog produk.</p>
          }
        >
          <ProductCatalog
            eyebrow="Produk Warga"
            products={products}
            title="Katalog Produk Kampung Herbal"
          />
        </Suspense>
      </Container>
    </section>
  );
}
