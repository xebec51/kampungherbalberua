import Link from "next/link";
import type { Product } from "@/types";
import { ProductImage } from "@/components/products/ProductImage";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice, getAvailabilityLabel } from "@/lib/formatters";
import { getProductWhatsAppAction } from "@/lib/product-actions";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const whatsappAction = getProductWhatsAppAction(product);

  return (
    <PublicCard>
      <ProductImage className="!rounded-none !border-0 !shadow-none" product={product} />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="green">{product.category}</StatusBadge>
          <StatusBadge tone="neutral">
            {getAvailabilityLabel(product.availability)}
          </StatusBadge>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-extrabold leading-tight text-herbal-ink sm:mt-4 sm:text-lg">
          <Link
            className="transition hover:text-herbal-green"
            href={`/produk/${product.slug}`}
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
          {product.description}
        </p>
        <p className="mt-2 text-xs font-bold text-herbal-brown sm:mt-3 sm:text-sm">
          {formatPrice(product.price, product.unit)}
        </p>
        <div className="mt-3 grid gap-1.5 sm:mt-4 sm:gap-2">
          <PublicCardAction
            className="mt-0"
            href={`/produk/${product.slug}`}
            variant="secondary"
          >
            Detail produk
          </PublicCardAction>
          {whatsappAction.disabled ? (
            <button
              className="inline-flex min-h-9 cursor-not-allowed items-center justify-center rounded-md border border-herbal-green/20 bg-white px-3 py-2 text-xs font-bold text-herbal-muted sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-sm"
              disabled
              type="button"
            >
              {whatsappAction.label}
            </button>
          ) : (
            <a
              className="inline-flex min-h-9 items-center justify-center rounded-md bg-herbal-deep px-3 py-2 text-xs font-bold !text-white shadow-[0_10px_24px_rgba(17,27,21,0.16)] transition hover:bg-herbal-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-sm"
              href={whatsappAction.href}
              rel="noreferrer"
              target="_blank"
            >
              {whatsappAction.label}
            </a>
          )}
        </div>
      </PublicCardBody>
    </PublicCard>
  );
}
