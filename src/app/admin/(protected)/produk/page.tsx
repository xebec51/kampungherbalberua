import type { Metadata } from "next";
import { AdminActionBar, AdminActionLink } from "@/components/admin/AdminActionBar";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToneBadge } from "@/components/admin/AdminStatusBadge";
import { DeleteConfirmForm } from "@/components/admin/DeleteConfirmForm";
import { SelectField, TextField } from "@/components/admin/fields";
import { StaticPageQrPanel } from "@/components/admin/StaticPageQrPanel";
import { deleteProductAction } from "@/app/admin/(protected)/produk/actions";
import { canDeleteContent, canEditContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  getAllProductsForAdmin,
  type ProductAdminFilters,
  type ProductAdminRecord,
} from "@/lib/data/admin/products";
import type { ProductAvailability } from "@/lib/supabase/database.types";
import { createPageMetadata } from "@/lib/metadata";
import { paginateItems, parsePageParam } from "@/lib/pagination";
import {
  createProductCatalogQrSvg,
  getProductCatalogQrTarget,
} from "@/lib/qr/health-zone-qr";

type AdminProductsPageProps = {
  searchParams: Promise<{
    availability?: string;
    error?: string;
    halaman?: string;
    q?: string;
    success?: string;
  }>;
};

const ADMIN_PRODUCTS_PAGE_SIZE = 10;

const availabilityLabels: Record<ProductAvailability, string> = {
  habis: "Habis",
  "segera-tersedia": "Pesan Khusus",
  terbatas: "Terbatas",
  tersedia: "Tersedia",
};

const availabilityTone: Record<ProductAvailability, "green" | "brown" | "neutral"> = {
  habis: "brown",
  "segera-tersedia": "neutral",
  terbatas: "neutral",
  tersedia: "green",
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug produk sudah dipakai.",
  gagal: "Aksi produk belum dapat diproses.",
  hapus: "Penghapusan hanya tersedia untuk admin dan wajib dikonfirmasi.",
  "tidak-ditemukan": "Produk tidak ditemukan.",
  otorisasi: "Hanya admin yang dapat menjalankan aksi tersebut.",
  validasi: "Periksa kembali isian produk.",
};

const successMessages: Record<string, string> = {
  dibuat: "Produk berhasil dibuat.",
  dihapus: "Produk berhasil dihapus.",
  diperbarui: "Perubahan produk berhasil disimpan.",
  "foto-diperbarui": "Foto produk berhasil diunggah.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Produk",
  description: "Daftar dan pengelolaan data produk warga Kampung Herbal Berua.",
  path: "/admin/produk",
});

function parseAvailability(value?: string): ProductAdminFilters["availability"] {
  if (
    value === "tersedia" ||
    value === "terbatas" ||
    value === "habis" ||
    value === "segera-tersedia"
  ) {
    return value;
  }

  return "all";
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const { profile } = await requireStaff("/admin/produk");
  const filters: ProductAdminFilters = {
    availability: parseAvailability(params.availability),
    query: params.q?.trim(),
  };
  const result = await getAllProductsForAdmin(filters);
  const pagination = paginateItems(
    result.data ?? [],
    parsePageParam(params.halaman),
    ADMIN_PRODUCTS_PAGE_SIZE,
  );
  const products = pagination.items;
  const activeFilterCount = [
    filters.query,
    filters.availability !== "all" ? filters.availability : "",
  ].filter(Boolean).length;
  const resultSummary = result.error
    ? "Filter daftar produk belum dapat dimuat."
    : pagination.totalItems > 0
      ? `Menampilkan ${pagination.startItem}-${pagination.endItem} dari ${pagination.totalItems} produk.`
      : "Tidak ada produk yang cocok dengan filter.";
  const productCatalogQrTarget = getProductCatalogQrTarget();
  const productCatalogQrSvg = await createProductCatalogQrSvg();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          canEditContent(profile.role) ? (
            <AdminActionLink href="/admin/produk/baru" variant="primary">
              Tambah Produk
            </AdminActionLink>
          ) : null
        }
        description="Kelola katalog produk warga melalui Supabase. Tidak ada alur draf/publikasi -- perubahan langsung tampil publik."
        eyebrow="Admin Produk"
        title="Daftar Produk"
      />

      <StaticPageQrPanel
        destinationHref="/produk"
        destinationLabel="Buka halaman tujuan"
        downloadBaseHref="/admin/produk/qr"
        heading="QR permanen katalog produk"
        previewLabel="Pratinjau QR untuk katalog produk"
        svg={productCatalogQrSvg}
        targetUrl={productCatalogQrTarget}
      />

      <AdminNotice message={successMessages[params.success ?? ""]} />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />

      <AdminFilterBar
        activeCount={activeFilterCount}
        resetHref="/admin/produk"
        resultSummary={resultSummary}
        title="Atur filter produk"
      >
        <TextField
          className="lg:w-72"
          defaultValue={filters.query ?? ""}
          label="Cari produk"
          name="q"
          type="search"
        />
        <SelectField
          className="lg:w-48"
          defaultValue={filters.availability ?? "all"}
          label="Ketersediaan"
          name="availability"
          options={[
            { label: "Semua", value: "all" },
            ...Object.entries(availabilityLabels).map(([value, label]) => ({
              label,
              value,
            })),
          ]}
        />
      </AdminFilterBar>

      {result.error || !result.data ? (
        <AdminEmptyState
          description={result.error ?? "Daftar produk belum dapat dimuat."}
          title="Daftar produk belum dapat dimuat"
        />
      ) : products.length === 0 ? (
        <AdminEmptyState
          description="Coba ubah kata kunci atau filter ketersediaan."
          title="Belum ada produk yang cocok"
        />
      ) : (
        <section aria-label="Daftar produk admin" className="grid gap-3">
          {products.map((product) => (
            <ProductAdminCard
              canDelete={canDeleteContent(profile.role)}
              canEdit={canEditContent(profile.role)}
              key={product.id}
              product={product}
            />
          ))}
        </section>
      )}
      {!result.error && result.data ? (
        <AdminPagination
          currentPage={pagination.currentPage}
          endItem={pagination.endItem}
          params={{
            availability: filters.availability,
            q: filters.query,
          }}
          pathname="/admin/produk"
          startItem={pagination.startItem}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      ) : null}
    </div>
  );
}

type ProductAdminCardProps = {
  canDelete: boolean;
  canEdit: boolean;
  product: ProductAdminRecord;
};

function ProductAdminCard({ canDelete, canEdit, product }: ProductAdminCardProps) {
  return (
    <article className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AdminToneBadge tone={availabilityTone[product.availability]}>
              {availabilityLabels[product.availability]}
            </AdminToneBadge>
            {product.featured ? (
              <AdminToneBadge tone="neutral">Unggulan</AdminToneBadge>
            ) : null}
          </div>
          <h3 className="mt-2 truncate text-lg font-bold text-herbal-ink">
            {product.name}
          </h3>
          <p className="text-xs text-herbal-muted">/produk/{product.slug}</p>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-herbal-muted">
            {product.description}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-herbal-muted">
            Diperbarui {new Date(product.updated_at).toLocaleString("id-ID")}
          </p>
        </div>
        <AdminActionBar align="end" className="shrink-0">
          <AdminActionLink href={`/admin/produk/${product.id}/edit`} variant="secondary">
            {canEdit ? "Edit" : "Lihat"}
          </AdminActionLink>
          {canDelete ? (
            <DeleteConfirmForm
              action={deleteProductAction}
              entityId={product.id}
              entityLabel={`Produk "${product.name}"`}
            />
          ) : null}
        </AdminActionBar>
      </div>
    </article>
  );
}
