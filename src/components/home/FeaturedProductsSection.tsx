import { Reveal } from "@/components/motion/Reveal";
import { ProductCard } from "@/components/products/ProductCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedProducts } from "@/lib/data/products";

export async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedProducts();

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="home-section bg-gradient-to-b from-white via-herbal-cream to-white py-14 sm:py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              description="Cuplikan produk warga yang dapat dipesan langsung melalui WhatsApp."
              eyebrow="Produk Warga"
              title="Produk Kampung Herbal"
            />
            <LinkButton href="/produk" variant="secondary">
              Lihat Katalog Produk
            </LinkButton>
          </div>
        </Reveal>
        <AutoCarousel
          ariaLabel="Carousel produk pilihan warga"
          className="mt-8"
          edgeTone="cream"
          itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[24%] xl:basis-[19%]"
        >
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
