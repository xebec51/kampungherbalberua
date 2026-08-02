import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/products/ProductImage";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getProductBySlug, products } from "@/data/products";
import { formatPrice, getAvailabilityLabel } from "@/lib/formatters";
import { createPageMetadata } from "@/lib/metadata";
import { getProductWhatsAppAction } from "@/lib/product-actions";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return createPageMetadata({
      title: "Produk tidak ditemukan",
      description: "Data produk yang diminta tidak tersedia.",
      path: "/produk",
    });
  }

  return createPageMetadata({
    title: product.name,
    description: product.description,
    path: `/produk/${product.slug}`,
  });
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const whatsappAction = getProductWhatsAppAction(product);

  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[
            { label: "Produk", href: "/produk" },
            { label: product.name },
          ]}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <ProductImage priority product={product} size="detail" />

          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="green">{product.category}</StatusBadge>
              <StatusBadge tone="neutral">
                {getAvailabilityLabel(product.availability)}
              </StatusBadge>
            </div>
            <h1 className="mt-5 text-4xl font-bold text-herbal-ink sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-8 text-herbal-muted">
              {product.description}
            </p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <ProductInfo label="Harga" value={formatPrice(product.price, product.unit)} />
              <ProductInfo label="Satuan" value={product.unit ?? "Per item"} />
              <ProductInfo label="Produsen" value={product.producerName} />
              <ProductInfo
                label="Status"
                value={getAvailabilityLabel(product.availability)}
              />
            </dl>

            <div className="mt-8">
              {whatsappAction.disabled ? (
                <button
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-herbal-green/20 bg-white px-5 py-2.5 text-sm font-semibold text-herbal-muted"
                  disabled
                  type="button"
                >
                  {whatsappAction.label}
                </button>
              ) : (
                <a
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                  href={whatsappAction.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {whatsappAction.label}
                </a>
              )}
              <p className="mt-3 text-sm leading-6 text-herbal-muted">
                Transaksi, pembayaran, dan pengiriman diselesaikan langsung
                bersama pengelola produk melalui WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </article>
  );
}

type ProductInfoProps = {
  label: string;
  value: string;
};

function ProductInfo({ label, value }: ProductInfoProps) {
  return (
    <div className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <dt className="text-sm font-semibold text-herbal-muted">{label}</dt>
      <dd className="mt-2 text-base font-bold text-herbal-ink">{value}</dd>
    </div>
  );
}
