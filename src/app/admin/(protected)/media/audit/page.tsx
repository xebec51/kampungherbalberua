import Link from "next/link";
import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAdminMediaAuditSummary } from "@/lib/data/admin/media-audit";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Audit Media",
  description: "Audit kualitas dan duplikasi media katalog Kampung Herbal Berua.",
  path: "/admin/media/audit",
});

export default async function AdminMediaAuditPage() {
  const result = await getAdminMediaAuditSummary();
  const audit = result.data;

  return (
    <div className="grid gap-6">
      <header className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
        <Link
          className="text-sm font-semibold text-herbal-green hover:underline"
          href="/admin/media"
        >
          Kembali ke Media
        </Link>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
          Audit Media
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-normal text-herbal-ink">
          Kualitas Gambar Katalog
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
          Pantau gambar katalog Harmony yang masih generik, penggunaan ulang
          berlebihan, metadata lisensi, dan item yang perlu ditinjau.
        </p>
      </header>

      {result.error || !audit ? (
        <section className="rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-5 text-sm leading-6 text-herbal-brown shadow-sm">
          {result.error ?? "Audit belum tersedia."}
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Total media" value={audit.totalMedia} />
            <MetricCard label="Attachment katalog" value={audit.posterAttachments} />
            <MetricCard label="Foto spesifik" value={audit.specificPosterImages} />
            <MetricCard label="Visual sementara" value={audit.genericPosterImages} />
            <MetricCard label="Reuse berlebihan" value={audit.excessiveReuse.length} />
            <MetricCard label="Resolusi rendah" value={audit.lowResolution} />
            <MetricCard label="Atribusi belum lengkap" value={audit.incompleteAttribution} />
            <MetricCard label="Needs review" value={audit.needsReview} />
          </section>

          <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-herbal-ink">
                Penggunaan ulang berlebihan
              </h3>
              <StatusBadge tone={audit.excessiveReuse.length ? "brown" : "green"}>
                {audit.excessiveReuse.length ? "Perlu ditinjau" : "Terkendali"}
              </StatusBadge>
            </div>
            <div className="mt-4 grid gap-4">
              {audit.excessiveReuse.length === 0 ? (
                <p className="text-sm leading-6 text-herbal-muted">
                  Tidak ada media yang dipakai lebih dari tiga item katalog.
                </p>
              ) : (
                audit.excessiveReuse.map((item) => (
                  <article
                    className="rounded-md border border-herbal-green/10 bg-herbal-soft p-4"
                    key={item.mediaId}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-bold text-herbal-ink">{item.title}</h4>
                        <p className="mt-1 text-sm text-herbal-muted">
                          Dipakai pada {item.count} nama tanaman.
                        </p>
                      </div>
                      <Link
                        className="text-sm font-semibold text-herbal-green hover:underline"
                        href={`/admin/media/${item.mediaId}`}
                      >
                        Lihat media
                      </Link>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-herbal-muted">
                      {item.names.join(", ")}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-herbal-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-herbal-ink">{value}</p>
    </article>
  );
}
