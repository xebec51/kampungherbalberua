import Link from "next/link";
import type { Metadata } from "next";
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
      <header className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
          Media Library
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-normal text-herbal-ink">
          Pustaka Media Global
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
          Pantau metadata, status hak, privasi, sumber, lisensi, dan duplikasi
          checksum untuk seluruh gambar website.
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-md border border-herbal-green/30 px-4 py-2 text-sm font-bold text-herbal-green hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          href="/admin/media/audit"
        >
          Buka audit media
        </Link>
      </header>

      <form className="grid gap-3 rounded-md border border-herbal-green/10 bg-white p-4 shadow-sm md:grid-cols-[1fr_12rem_auto]">
        <label className="grid gap-2 text-sm font-semibold text-herbal-ink">
          Cari media
          <input
            className="min-h-11 rounded-md border border-herbal-green/20 px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            defaultValue={params?.q ?? ""}
            name="q"
            placeholder="Judul, kode, atau sumber"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-herbal-ink">
          Status
          <select
            className="min-h-11 rounded-md border border-herbal-green/20 px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            defaultValue={params?.status ?? ""}
            name="status"
          >
            <option value="">Semua</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <button
          className="self-end rounded-md bg-herbal-green px-4 py-3 text-sm font-bold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          type="submit"
        >
          Terapkan
        </button>
      </form>

      {result.error ? (
        <section className="rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-5 text-sm leading-6 text-herbal-brown shadow-sm">
          {result.error}
        </section>
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
