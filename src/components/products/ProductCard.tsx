import Link from "next/link";
import type { Product } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice, getAvailabilityLabel } from "@/lib/formatters";
import { createProductOrderWhatsAppUrl } from "@/lib/whatsapp";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const whatsappUrl = createProductOrderWhatsAppUrl(product);

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
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-herbal-green/60 bg-white px-4 py-2 text-sm font-semibold text-herbal-deep transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            href={`/produk/${product.slug}`}
          >
            Detail produk
          </Link>
          {whatsappUrl ? (
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              Pesan via WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
