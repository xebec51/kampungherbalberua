import { ProductCard } from "@/components/products/ProductCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredProducts } from "@/data/products";

export function FeaturedProductsSection() {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Katalog ini akan diperbarui setelah produk warga, harga, ketersediaan, dan kontak pengelola diverifikasi."
            eyebrow="Produk Warga"
            title="Produk pilihan warga"
          />
          <LinkButton href="/produk" variant="secondary">
            Lihat Katalog Produk
          </LinkButton>
        </div>
        <AutoCarousel
          ariaLabel="Carousel produk pilihan warga"
          className="mt-8"
          edgeTone="white"
          itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[31%] xl:max-w-[19.5rem]"
        >
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
