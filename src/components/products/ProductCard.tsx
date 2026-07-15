import Link from "next/link";
import type { Product } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice, getAvailabilityLabel } from "@/lib/formatters";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm">
      <ImagePlaceholder
        label={`Ilustrasi placeholder produk ${product.name}`}
        variant="product"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="green">{product.category}</StatusBadge>
          <StatusBadge tone="neutral">
            {getAvailabilityLabel(product.availability)}
          </StatusBadge>
        </div>
        <h3 className="mt-4 text-xl font-bold text-herbal-ink">
          <Link className="hover:text-herbal-green" href={`/produk/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-4 flex-1 text-sm leading-6 text-herbal-muted">
          {product.description}
        </p>
        <p className="mt-4 text-sm font-semibold text-herbal-brown">
          {formatPrice(product.price, product.unit)}
        </p>
        <Link
          className="mt-5 inline-flex text-sm font-semibold text-herbal-green hover:underline"
          href={`/produk/${product.slug}`}
        >
          Lihat detail produk
        </Link>
      </div>
    </article>
  );
}
