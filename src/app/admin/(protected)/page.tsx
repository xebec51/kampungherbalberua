import type { Metadata } from "next";
import { AdminActionLink } from "@/components/admin/AdminActionBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CopyQrUrlButton } from "@/components/admin/CopyQrUrlButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAdminDashboardStats } from "@/lib/data/admin/dashboard";
import { getAllHealthZonesForAdmin } from "@/lib/data/admin/health-zones";
import { getAllStreetsForAdmin } from "@/lib/data/admin/streets";
import { createPageMetadata } from "@/lib/metadata";
import { getHealthZoneQrTarget, getStreetQrTarget } from "@/lib/qr/health-zone-qr";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard Admin",
  description: "Ringkasan pengelolaan konten Kampung Herbal Berua.",
  path: "/admin",
});

export default async function AdminDashboardPage() {
  const [result, zonesResult, streetsResult] = await Promise.all([
    getAdminDashboardStats(),
    getAllHealthZonesForAdmin({ contentStatus: "published" }),
    getAllStreetsForAdmin(),
  ]);
  const stats = result.data;
  const publishedZones = zonesResult.data ?? [];
  const publishedStreets =
    streetsResult.data?.filter((street) => street.content_status === "published") ??
    [];

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={<StatusBadge tone="green">Akses staf aktif</StatusBadge>}
        className="brand-pattern"
        description="Kelola data tanaman dan zona kesehatan. Data admin selalu dibaca dari Supabase dan tidak memakai fallback lokal."
        eyebrow="Admin"
        title="Dashboard Konten"
      />

      {result.error || !stats ? (
        <section className="rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-5 text-sm leading-6 text-herbal-brown shadow-sm">
          <h3 className="text-base font-bold">Dashboard belum dapat dimuat</h3>
          <p className="mt-2">{result.error ?? "Data dashboard belum tersedia."}</p>
        </section>
      ) : (
        <section aria-label="Statistik dashboard" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Seluruh tanaman" value={stats.totalPlants} />
          <StatCard label="Tanaman draft" value={stats.draftPlants} />
          <StatCard
            label="Tanaman pending review"
            value={stats.pendingReviewPlants}
          />
          <StatCard label="Tanaman published" value={stats.publishedPlants} />
          <StatCard label="Tanaman archived" value={stats.archivedPlants} />
          <StatCard label="Zona kesehatan" value={stats.totalHealthZones} />
          <StatCard label="Zona draft" value={stats.zoneDrafts} />
          <StatCard label="Zona published" value={stats.zonePublished} />
          <StatCard
            label="Materi menunggu verifikasi"
            value={stats.pendingVerificationItems}
          />
        </section>
      )}

      <section className="grid gap-4 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-herbal-ink">
              QR Permanen Publik
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-herbal-muted">
              QR baru memakai kunci publik permanen. Route lama zona tetap
              tersedia hanya untuk kompatibilitas.
            </p>
          </div>
          <StatusBadge tone="green">
            {publishedZones.length + publishedStreets.length} target published
          </StatusBadge>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <QrList
            emptyText={zonesResult.error ?? "Belum ada zona published."}
            items={publishedZones.map((zone) => ({
              adminQrPath: `/admin/zona/${zone.id}/qr`,
              destinationPath: `/zona-kesehatan/${zone.slug}`,
              label: zone.zone_name,
              qrUrl: getHealthZoneQrTarget(zone.qr_key),
              subtitle: `/qr/zona/${zone.qr_key}`,
            }))}
            title="Zona Kesehatan"
          />
          <QrList
            emptyText={streetsResult.error ?? "Belum ada jalan published."}
            items={publishedStreets.map((street) => ({
              adminQrPath: `/admin/jalan/${street.id}/qr`,
              destinationPath: `/jalan/${street.slug}`,
              label: street.street_name,
              qrUrl: getStreetQrTarget(street.qr_key),
              subtitle: `/qr/jalan/${street.qr_key}`,
            }))}
            title="Jalan Tematik"
          />
        </div>
      </section>
    </div>
  );
}

type QrListProps = {
  emptyText: string;
  items: Array<{
    adminQrPath: string;
    destinationPath: string;
    label: string;
    qrUrl: string;
    subtitle: string;
  }>;
  title: string;
};

function QrList({ emptyText, items, title }: QrListProps) {
  return (
    <section className="rounded-md border border-herbal-green/10 bg-herbal-soft p-4">
      <h4 className="text-base font-bold text-herbal-ink">{title}</h4>
      {items.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-herbal-muted">{emptyText}</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <article
              className="rounded-md border border-herbal-green/10 bg-white p-4"
              key={item.qrUrl}
            >
              <p className="font-bold text-herbal-ink">{item.label}</p>
              <p className="mt-1 break-words text-xs font-semibold uppercase tracking-[0.12em] text-herbal-muted">
                {item.subtitle}
              </p>
              <p className="mt-2 break-words text-xs leading-5 text-herbal-muted">
                {item.qrUrl}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminActionLink href={`${item.adminQrPath}?format=svg`} variant="primary">
                  Unduh QR SVG
                </AdminActionLink>
                <AdminActionLink href={`${item.adminQrPath}?format=png`} variant="secondary">
                  Unduh QR PNG
                </AdminActionLink>
                <AdminActionLink href={item.destinationPath} variant="secondary">
                  Buka halaman tujuan
                </AdminActionLink>
                <CopyQrUrlButton url={item.qrUrl} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: number | null;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)]">
      <p className="text-sm font-semibold text-herbal-muted">{label}</p>
      <p className="mt-3 text-3xl font-bold text-herbal-ink">
        {value === null ? "Belum tersedia" : value}
      </p>
    </article>
  );
}
