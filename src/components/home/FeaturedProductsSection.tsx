import { ProductCard } from "@/components/products/ProductCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredProducts, sampleProductNotice } from "@/data/products";

export function FeaturedProductsSection() {
  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="home-section bg-gradient-to-b from-white via-herbal-cream to-white py-14 sm:py-16">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description={
              <>
                Cuplikan produk contoh untuk menguji katalog dan tautan WhatsApp.{" "}
                {sampleProductNotice}
              </>
            }
            eyebrow="Produk Warga"
            title="Contoh Produk Kampung Herbal"
          />
          <LinkButton href="/produk" variant="secondary">
            Lihat Katalog Produk
          </LinkButton>
        </div>
        <AutoCarousel
          ariaLabel="Carousel produk pilihan warga"
          className="mt-8"
          edgeTone="cream"
          itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[30%] xl:basis-[23%] xl:max-w-[18rem]"
        >
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
