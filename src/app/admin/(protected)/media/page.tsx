import Link from "next/link";
import type { Metadata } from "next";
import { AdminActionLink } from "@/components/admin/AdminActionBar";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SelectField, TextField } from "@/components/admin/fields";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAdminMediaAssets } from "@/lib/data/admin/media";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Media",
  description: "Kelola metadata Media Library Kampung Herbal Berua.",
  path: "/admin/media",
});

type AdminMediaPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function AdminMediaPage({
  searchParams,
}: AdminMediaPageProps) {
  const params = await searchParams;
  const result = await getAdminMediaAssets({
    q: params?.q,
    status: params?.status,
  });

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

      <AdminFilterBar>
        <TextField
          className="lg:w-72"
          defaultValue={params?.q ?? ""}
          label="Cari media"
          name="q"
          type="search"
        />
        <SelectField
          className="lg:w-48"
          defaultValue={params?.status ?? ""}
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
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-4 py-2 text-sm font-bold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          type="submit"
        >
          Terapkan
        </button>
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
            {result.data.length === 0 ? (
              <p className="p-5 text-sm text-herbal-muted">
                Belum ada media yang cocok dengan filter.
              </p>
            ) : (
              result.data.map((media) => (
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
    </div>
  );
}
