import type { Metadata } from "next";
import { ProductCard } from "@/components/products/ProductCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { products } from "@/data/products";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Produk Warga",
  description:
    "Katalog produk warga Kampung Herbal Berua.",
  path: "/produk",
});

export default function ProductsPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Produk warga yang telah memiliki data publik akan ditampilkan di halaman ini."
          eyebrow="Produk Warga"
          title="Katalog produk Kampung Herbal"
        />
        {products.length > 0 ? (
          <AutoCarousel
            ariaLabel="Carousel katalog produk warga"
            className="mt-8"
            itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[31%] xl:max-w-[19.5rem]"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AutoCarousel>
        ) : null}
      </Container>
    </section>
  );
}
