import type { Metadata } from "next";
import { ProductCard } from "@/components/products/ProductCard";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { products, sampleProductNotice } from "@/data/products";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Produk Warga",
  description:
    "Katalog produk contoh Kampung Herbal Harmony Berua untuk pengujian tampilan dan pemesanan WhatsApp.",
  path: "/produk",
});

export default function ProductsPage() {
  return (
    <>
      <PageHero
        description="Produk asli Kampung Herbal Harmony Berua masih dalam pendataan. Katalog ini menampilkan produk contoh agar tampilan, detail, dan tautan WhatsApp dapat diuji sebelum data resmi diterima."
        eyebrow="Produk Warga"
        title="Katalog Produk Kampung Herbal"
      />
      <section className="bg-herbal-cream py-10 sm:py-12">
        <Container>
          <div className="rounded-[var(--radius-card)] border border-herbal-brown/20 bg-white p-5 text-sm leading-7 text-herbal-muted shadow-[var(--shadow-soft)]">
            <strong className="block text-base text-herbal-ink">Produk contoh</strong>
            <span>{sampleProductNotice}</span>
          </div>
          <SectionHeading
            description="Setiap kartu diberi label sementara. Pertanyaan produk diarahkan ke WhatsApp pengelola, dan website tidak memproses checkout atau pembayaran."
            eyebrow="Katalog sementara"
            title="Daftar Produk Contoh"
          />
          <div
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            data-product-grid
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
