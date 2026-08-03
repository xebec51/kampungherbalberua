import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCatalog } from "@/components/products/ProductCatalog";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { products } from "@/data/products";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Produk Warga",
  description:
    "Katalog produk warga Kampung Herbal Harmony Berua dengan pemesanan melalui WhatsApp.",
  path: "/produk",
});

export default function ProductsPage() {
  return (
    <>
      <PageHero
        className="py-6 sm:py-7 lg:py-8"
        eyebrow="Produk Warga"
        title="Katalog Produk Kampung Herbal"
      />
      <section className="bg-herbal-cream py-4 sm:py-5">
        <Container>
          <Suspense
            fallback={
              <p className="text-sm text-herbal-muted">
                Memuat katalog produk.
              </p>
            }
          >
            <ProductCatalog products={products} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
