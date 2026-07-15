import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getProductBySlug, products } from "@/data/products";
import { formatPrice, getAvailabilityLabel } from "@/lib/formatters";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produk tidak ditemukan | Kampung Herbal Berua",
    };
  }

  return {
    title: `${product.name} | Produk Warga Kampung Herbal Berua`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const whatsappUrl = createWhatsAppUrl(
    product.whatsappNumber,
    `Halo, saya ingin bertanya tentang ${product.name} dari Kampung Herbal Berua.`,
  );

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
          <ImagePlaceholder
            label={`Ilustrasi placeholder produk ${product.name}`}
            variant="product"
          />

          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="green">{product.category}</StatusBadge>
              <StatusBadge tone="neutral">
                {getAvailabilityLabel(product.availability)}
              </StatusBadge>
              <StatusBadge tone="brown">Data demonstrasi</StatusBadge>
            </div>
            <h1 className="mt-5 text-4xl font-bold text-herbal-ink sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-8 text-herbal-muted">
              {product.description}
            </p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <ProductInfo label="Harga" value={formatPrice(product.price, product.unit)} />
              <ProductInfo label="Satuan" value={product.unit ?? "Segera tersedia"} />
              <ProductInfo label="Produsen" value={product.producerName} />
              <ProductInfo
                label="Status"
                value={getAvailabilityLabel(product.availability)}
              />
            </dl>

            <div className="mt-8">
              {whatsappUrl ? (
                <a
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Pesan melalui WhatsApp
                </a>
              ) : (
                <button
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-herbal-green/20 bg-white px-5 py-2.5 text-sm font-semibold text-herbal-muted"
                  disabled
                  type="button"
                >
                  Kontak segera tersedia
                </button>
              )}
              <p className="mt-3 text-sm leading-6 text-herbal-muted">
                Katalog belum mendukung keranjang, checkout, pembayaran, kurir,
                atau manajemen stok pada tahap pertama.
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
