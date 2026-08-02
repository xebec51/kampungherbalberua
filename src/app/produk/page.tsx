import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCatalog } from "@/components/products/ProductCatalog";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
        description="Produk warga Kampung Herbal Harmony Berua dapat ditanyakan dan dipesan langsung melalui WhatsApp pengelola."
        eyebrow="Produk Warga"
        title="Katalog Produk Kampung Herbal"
      />
      <section className="bg-herbal-cream py-10 sm:py-12">
        <Container>
          <Reveal>
            <SectionHeading
              description="Pertanyaan dan pemesanan produk dilayani langsung melalui WhatsApp pengelola."
              eyebrow="Katalog Produk"
              title="Produk Warga Kampung Herbal"
            />
          </Reveal>
          <Suspense
            fallback={
              <p className="mt-8 text-sm text-herbal-muted">
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
