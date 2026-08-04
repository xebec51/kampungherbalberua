import Link from "next/link";
import type { Metadata } from "next";
import {
  Camera,
  Copy,
  Eye,
  FileWarning,
  Image as ImageIcon,
  Paperclip,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToneBadge as StatusBadge } from "@/components/admin/AdminStatusBadge";
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
      <AdminPageHeader
        backHref="/admin/media"
        backLabel="Kembali ke Media"
        description="Pantau gambar katalog Harmony yang masih generik, penggunaan ulang berlebihan, metadata lisensi, dan item yang perlu ditinjau."
        eyebrow="Audit Media"
        title="Kualitas Gambar Katalog"
      />

      {result.error || !audit ? (
        <AdminEmptyState
          description={result.error ?? "Audit belum tersedia."}
          title="Audit media belum dapat dimuat"
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard icon={ImageIcon} label="Total media" value={audit.totalMedia} />
            <MetricCard
              icon={Paperclip}
              label="Attachment katalog"
              value={audit.posterAttachments}
            />
            <MetricCard icon={Camera} label="Foto spesifik" value={audit.specificPosterImages} />
            <MetricCard
              icon={ImageIcon}
              label="Visual sementara"
              value={audit.genericPosterImages}
            />
            <MetricCard icon={Copy} label="Reuse berlebihan" value={audit.excessiveReuse.length} />
            <MetricCard icon={ZoomOut} label="Resolusi rendah" value={audit.lowResolution} />
            <MetricCard
              icon={FileWarning}
              label="Atribusi belum lengkap"
              value={audit.incompleteAttribution}
            />
            <MetricCard icon={Eye} label="Needs review" value={audit.needsReview} />
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

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-admin-canvas text-admin-rail-active">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-herbal-muted">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-bold text-herbal-ink">{value}</p>
    </article>
  );
}
