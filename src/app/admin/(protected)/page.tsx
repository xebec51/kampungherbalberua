import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAdminDashboardStats } from "@/lib/data/admin/dashboard";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard Admin",
  description: "Ringkasan pengelolaan konten Kampung Herbal Berua.",
  path: "/admin",
});

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardStats();
  const stats = result.data;

  return (
    <div className="grid gap-6">
      <header className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
              Admin
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal text-herbal-ink">
              Dashboard Konten
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
              Kelola data tanaman dan zona kesehatan. Data admin selalu dibaca
              dari Supabase dan tidak memakai fallback lokal.
            </p>
          </div>
          <StatusBadge tone="green">Akses staf aktif</StatusBadge>
        </div>
      </header>

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
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number | null;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-herbal-muted">{label}</p>
      <p className="mt-3 text-3xl font-bold text-herbal-ink">
        {value === null ? "Belum tersedia" : value}
      </p>
    </article>
  );
}
