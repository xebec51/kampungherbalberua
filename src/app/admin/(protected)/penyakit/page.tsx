import type { Metadata } from "next";
import { AdminActionBar, AdminActionLink } from "@/components/admin/AdminActionBar";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteConfirmForm } from "@/components/admin/DeleteConfirmForm";
import { TextField } from "@/components/admin/fields";
import { deleteHealthConditionAction } from "@/app/admin/(protected)/penyakit/actions";
import { canDeleteContent, canEditContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  getAllHealthConditionsForAdmin,
  type HealthConditionAdminRecord,
} from "@/lib/data/admin/health-conditions";
import { createPageMetadata } from "@/lib/metadata";
import { paginateItems, parsePageParam } from "@/lib/pagination";

type AdminHealthConditionsPageProps = {
  searchParams: Promise<{
    error?: string;
    halaman?: string;
    q?: string;
    success?: string;
  }>;
};

const ADMIN_HEALTH_CONDITIONS_PAGE_SIZE = 10;

const errorMessages: Record<string, string> = {
  duplikat: "Slug penyakit sudah dipakai.",
  gagal: "Aksi penyakit belum dapat diproses.",
  hapus: "Penghapusan hanya tersedia untuk admin dan wajib dikonfirmasi.",
  "tidak-ditemukan": "Penyakit tidak ditemukan.",
  otorisasi: "Hanya admin yang dapat menjalankan aksi tersebut.",
  validasi: "Periksa kembali isian penyakit.",
};

const successMessages: Record<string, string> = {
  dibuat: "Penyakit berhasil dibuat.",
  dihapus: "Penyakit berhasil dihapus.",
  diperbarui: "Perubahan penyakit berhasil disimpan.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Katalog Penyakit",
  description: "Daftar dan pengelolaan Katalog Penyakit Kampung Herbal Berua.",
  path: "/admin/penyakit",
});

export default async function AdminHealthConditionsPage({
  searchParams,
}: AdminHealthConditionsPageProps) {
  const params = await searchParams;
  const { profile } = await requireStaff("/admin/penyakit");
  const query = params.q?.trim() ?? "";
  const result = await getAllHealthConditionsForAdmin({ query });
  const pagination = paginateItems(
    result.data ?? [],
    parsePageParam(params.halaman),
    ADMIN_HEALTH_CONDITIONS_PAGE_SIZE,
  );
  const healthConditions = pagination.items;
  const activeFilterCount = [query].filter(Boolean).length;
  const resultSummary = result.error
    ? "Filter daftar penyakit belum dapat dimuat."
    : pagination.totalItems > 0
      ? `Menampilkan ${pagination.startItem}-${pagination.endItem} dari ${pagination.totalItems} penyakit.`
      : "Tidak ada penyakit yang cocok dengan filter.";

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          canEditContent(profile.role) ? (
            <AdminActionLink href="/admin/penyakit/baru" variant="primary">
              Tambah Penyakit
            </AdminActionLink>
          ) : null
        }
        description="Kelola Katalog Penyakit -- daftar kondisi kesehatan dan tanaman terkait. Tidak ada alur draf/publikasi -- perubahan langsung tampil publik."
        eyebrow="Admin Katalog Penyakit"
        title="Daftar Penyakit"
      />

      <AdminNotice message={successMessages[params.success ?? ""]} />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />

      <AdminFilterBar
        activeCount={activeFilterCount}
        resetHref="/admin/penyakit"
        resultSummary={resultSummary}
        title="Atur filter penyakit"
      >
        <TextField
          className="lg:w-72"
          defaultValue={query}
          label="Cari penyakit"
          name="q"
          type="search"
        />
      </AdminFilterBar>

      {result.error || !result.data ? (
        <AdminEmptyState
          description={result.error ?? "Daftar penyakit belum dapat dimuat."}
          title="Daftar penyakit belum dapat dimuat"
        />
      ) : healthConditions.length === 0 ? (
        <AdminEmptyState
          description="Coba ubah kata kunci pencarian."
          title="Belum ada penyakit yang cocok"
        />
      ) : (
        <section aria-label="Daftar penyakit admin" className="grid gap-3">
          {healthConditions.map((healthCondition) => (
            <HealthConditionAdminCard
              canDelete={canDeleteContent(profile.role)}
              canEdit={canEditContent(profile.role)}
              healthCondition={healthCondition}
              key={healthCondition.id}
            />
          ))}
        </section>
      )}
      {!result.error && result.data ? (
        <AdminPagination
          currentPage={pagination.currentPage}
          endItem={pagination.endItem}
          params={{ q: query }}
          pathname="/admin/penyakit"
          startItem={pagination.startItem}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      ) : null}
    </div>
  );
}

type HealthConditionAdminCardProps = {
  canDelete: boolean;
  canEdit: boolean;
  healthCondition: HealthConditionAdminRecord;
};

function HealthConditionAdminCard({
  canDelete,
  canEdit,
  healthCondition,
}: HealthConditionAdminCardProps) {
  return (
    <article className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-herbal-muted">
            Urutan {healthCondition.sort_order}
          </p>
          <h3 className="mt-2 truncate text-lg font-bold text-herbal-ink">
            {healthCondition.name}
          </h3>
          <p className="text-xs text-herbal-muted">/penyakit/{healthCondition.slug}</p>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-herbal-muted">
            {healthCondition.short_description}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-herbal-muted">
            Diperbarui {new Date(healthCondition.updated_at).toLocaleString("id-ID")}
          </p>
        </div>
        <AdminActionBar align="end" className="shrink-0">
          <AdminActionLink href={`/admin/penyakit/${healthCondition.id}/edit`} variant="secondary">
            {canEdit ? "Edit" : "Lihat"}
          </AdminActionLink>
          {canDelete ? (
            <DeleteConfirmForm
              action={deleteHealthConditionAction}
              entityId={healthCondition.id}
              entityLabel={`Penyakit "${healthCondition.name}"`}
            />
          ) : null}
        </AdminActionBar>
      </div>
    </article>
  );
}
