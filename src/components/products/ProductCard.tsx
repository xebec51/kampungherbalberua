import Link from "next/link";
import type { Product } from "@/types";
import { ProductImage } from "@/components/products/ProductImage";
import { PublicCard, PublicCardBody } from "@/components/ui/PublicCard";
import { formatPrice } from "@/lib/formatters";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      aria-label={product.name}
      className="block h-full rounded-[var(--radius-card)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-herbal-brown"
      href={`/produk/${product.slug}`}
    >
      <PublicCard className="transition duration-200 hover:border-herbal-green/25 hover:shadow-[0_18px_40px_rgba(17,27,21,0.12)]">
        <ProductImage
          className="!rounded-none !border-0 !shadow-none"
          product={product}
        />
        <PublicCardBody>
          <h3 className="line-clamp-2 text-sm font-extrabold leading-tight text-herbal-ink transition group-hover/card:text-herbal-green sm:text-lg">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
            {product.description}
          </p>
          <p className="mt-auto pt-3 text-xs font-bold text-herbal-brown sm:pt-4 sm:text-sm">
            {formatPrice(product.price, product.unit)}
          </p>
        </PublicCardBody>
      </PublicCard>
    </Link>
  );
}
