import Link from "next/link";
import type { Metadata } from "next";
import { AdminActionLink } from "@/components/admin/AdminActionBar";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SelectField, TextField } from "@/components/admin/fields";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAdminMediaAssets } from "@/lib/data/admin/media";
import { createPageMetadata } from "@/lib/metadata";
import { paginateItems, parsePageParam } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Media",
  description: "Kelola metadata Media Library Kampung Herbal Berua.",
  path: "/admin/media",
});

type AdminMediaPageProps = {
  searchParams?: Promise<{
    halaman?: string;
    q?: string;
    status?: string;
  }>;
};

const ADMIN_MEDIA_PAGE_SIZE = 12;

export default async function AdminMediaPage({
  searchParams,
}: AdminMediaPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const status = params?.status ?? "";
  const result = await getAdminMediaAssets({
    q: query,
    status,
  });
  const pagination = paginateItems(
    result.data,
    parsePageParam(params?.halaman),
    ADMIN_MEDIA_PAGE_SIZE,
  );
  const mediaItems = pagination.items;
  const activeFilterCount = [query, status].filter(Boolean).length;
  const resultSummary = result.error
    ? "Filter pustaka media belum dapat dimuat."
    : pagination.totalItems > 0
      ? `Menampilkan ${pagination.startItem}-${pagination.endItem} dari ${pagination.totalItems} media.`
      : "Tidak ada media yang cocok dengan filter.";

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          <AdminActionLink href="/admin/media/audit" variant="secondary">
            Buka audit media
          </AdminActionLink>
        }
        description="Pantau metadata, status hak, privasi, sumber, lisensi, dan duplikasi checksum untuk seluruh gambar website."
        eyebrow="Media Library"
        title="Pustaka Media Global"
      />

      <AdminFilterBar
        activeCount={activeFilterCount}
        resetHref="/admin/media"
        resultSummary={resultSummary}
        title="Atur filter media"
      >
        <TextField
          className="lg:w-72"
          defaultValue={query}
          label="Cari media"
          name="q"
          type="search"
        />
        <SelectField
          className="lg:w-48"
          defaultValue={status}
          label="Status"
          name="status"
          options={[
            { label: "Semua", value: "" },
            { label: "Draf", value: "draft" },
            { label: "Menunggu pemeriksaan", value: "pending_review" },
            { label: "Dipublikasikan", value: "published" },
            { label: "Diarsipkan", value: "archived" },
          ]}
        />
      </AdminFilterBar>

      {result.error ? (
        <AdminEmptyState description={result.error} title="Pustaka media belum dapat dimuat" />
      ) : (
        <section className="overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-herbal-green/10 bg-herbal-soft px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-herbal-muted md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
            <span>Media</span>
            <span>Sumber</span>
            <span>Status</span>
            <span>Checksum</span>
          </div>
          <div className="divide-y divide-herbal-green/10">
            {mediaItems.length === 0 ? (
              <p className="p-5 text-sm text-herbal-muted">
                Belum ada media yang cocok dengan filter.
              </p>
            ) : (
              mediaItems.map((media) => (
                <article
                  className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr] md:items-center"
                  key={media.id}
                >
                  <div>
                    <Link
                      className="font-bold text-herbal-ink hover:text-herbal-green hover:underline"
                      href={`/admin/media/${media.id}`}
                    >
                      {media.title}
                    </Link>
                    <p className="mt-1 text-xs text-herbal-muted">
                      {media.licenseCode ?? "Lisensi belum tersedia"}
                    </p>
                  </div>
                  <span className="text-herbal-muted">{media.sourceType}</span>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="green">{media.contentStatus}</StatusBadge>
                    <StatusBadge tone="brown">{media.rightsStatus}</StatusBadge>
                    <StatusBadge tone="neutral">{media.privacyStatus}</StatusBadge>
                  </div>
                  <span className="break-all font-mono text-xs text-herbal-muted">
                    {media.checksumSha256.slice(0, 16)}
                  </span>
                </article>
              ))
            )}
          </div>
        </section>
      )}
      {!result.error ? (
        <AdminPagination
          currentPage={pagination.currentPage}
          endItem={pagination.endItem}
          params={{ q: query, status }}
          pathname="/admin/media"
          startItem={pagination.startItem}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      ) : null}
    </div>
  );
}
