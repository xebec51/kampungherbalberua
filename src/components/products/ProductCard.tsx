import Link from "next/link";
import type { Product } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice, getAvailabilityLabel } from "@/lib/formatters";
import { createProductOrderWhatsAppUrl } from "@/lib/whatsapp";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const whatsappUrl = createProductOrderWhatsAppUrl(product);

  return (
    <PublicCard>
      <ImagePlaceholder
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        label={`Gambar sementara produk ${product.name}`}
        variant="product"
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="green">{product.category}</StatusBadge>
          <StatusBadge tone="neutral">
            {getAvailabilityLabel(product.availability)}
          </StatusBadge>
        </div>
        <h3 className="mt-4 line-clamp-2 text-lg font-extrabold leading-tight text-herbal-ink">
          <Link
            className="transition hover:text-herbal-green"
            href={`/produk/${product.slug}`}
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-herbal-muted">
          {product.description}
        </p>
        <p className="mt-3 text-sm font-bold text-herbal-brown">
          {formatPrice(product.price, product.unit)}
        </p>
        <div className="mt-4 grid gap-2">
          <PublicCardAction
            className="mt-0"
            href={`/produk/${product.slug}`}
            variant="secondary"
          >
            Detail produk
          </PublicCardAction>
          {whatsappUrl ? (
            <a
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-herbal-deep px-4 py-2.5 text-sm font-bold !text-white shadow-[0_10px_24px_rgba(17,27,21,0.16)] transition hover:bg-herbal-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              Pesan via WhatsApp
            </a>
          ) : null}
        </div>
      </PublicCardBody>
    </PublicCard>
  );
}
