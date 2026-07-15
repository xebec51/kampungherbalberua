import type { Metadata } from "next";
import { ProductCard } from "@/components/products/ProductCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { products } from "@/data/products";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Produk Warga",
  description:
    "Katalog demonstrasi produk warga Kampung Herbal Berua yang akan dilengkapi setelah pendataan.",
  path: "/produk",
});

export default function ProductsPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Katalog ini masih berupa data demonstrasi. Harga, stok, kontak produsen, dan detail produk akan ditambahkan setelah pendataan lapangan dan persetujuan pengelola."
            eyebrow="Produk Warga"
            title="Katalog produk Kampung Herbal"
          />
          <StatusBadge tone="brown">Data demonstrasi</StatusBadge>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
