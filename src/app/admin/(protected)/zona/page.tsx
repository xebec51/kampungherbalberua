import type { Metadata } from "next";
import { AdminActionBar, AdminActionLink } from "@/components/admin/AdminActionBar";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge, AdminToneBadge } from "@/components/admin/AdminStatusBadge";
import { DeleteConfirmForm } from "@/components/admin/DeleteConfirmForm";
import { SelectField, TextField } from "@/components/admin/fields";
import { WorkflowActionMenu } from "@/components/admin/WorkflowActionMenu";
import {
  deleteHealthZoneAction,
  setHealthZoneWorkflowAction,
} from "@/app/admin/(protected)/zona/actions";
import { canDeleteContent, canEditContent, canPublishContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  getAllHealthZonesForAdmin,
  type HealthZoneAdminFilters,
  type HealthZoneAdminRecord,
} from "@/lib/data/admin/health-zones";
import type { ContentStatus, ValidationStatus } from "@/lib/supabase/database.types";
import { createPageMetadata } from "@/lib/metadata";
import { paginateItems, parsePageParam } from "@/lib/pagination";

type AdminZonesPageProps = {
  searchParams: Promise<{
    content_status?: string;
    error?: string;
    halaman?: string;
    q?: string;
    success?: string;
    validation_status?: string;
  }>;
};

const ADMIN_ZONES_PAGE_SIZE = 6;

const contentLabels: Record<ContentStatus, string> = {
  archived: "Diarsipkan",
  draft: "Draf",
  pending_review: "Menunggu pemeriksaan",
  published: "Dipublikasikan",
};

const validationLabels: Record<ValidationStatus, string> = {
  data_demonstrasi: "Data demonstrasi",
  pending: "Menunggu pemeriksaan",
  rejected: "Perlu perbaikan",
  verified: "Terverifikasi",
};

const errorMessages: Record<string, string> = {
  alasan: "Alasan wajib diisi saat menandai perlu perbaikan.",
  duplikat: "Slug atau kode zona sudah digunakan.",
  gagal: "Aksi zona belum dapat diproses.",
  hapus: "Penghapusan hanya tersedia untuk admin dan wajib dikonfirmasi.",
  "tidak-ditemukan": "Zona kesehatan tidak ditemukan.",
  "tidak-lengkap":
    "Zona belum lengkap untuk dipublikasikan. Lengkapi catatan sumber dan isian wajib lain di halaman edit.",
  otorisasi: "Hanya admin yang dapat menjalankan aksi tersebut.",
  validasi: "Periksa kembali isian zona.",
};

const successMessages: Record<string, string> = {
  diarsipkan: "Zona berhasil diarsipkan.",
  dihapus: "Zona berhasil dihapus.",
  dipublikasikan: "Zona berhasil divalidasi dan dipublikasikan.",
  "perlu-perbaikan": "Zona ditandai perlu perbaikan.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Zona Kesehatan",
  description: "Daftar dan pengelolaan zona kesehatan Kampung Herbal Harmony.",
  path: "/admin/zona",
});

function parseContentStatus(value?: string): HealthZoneAdminFilters["contentStatus"] {
  if (
    value === "draft" ||
    value === "pending_review" ||
    value === "published" ||
    value === "archived"
  ) {
    return value;
  }

  return "all";
}

function parseValidationStatus(value?: string): HealthZoneAdminFilters["validationStatus"] {
  if (
    value === "data_demonstrasi" ||
    value === "pending" ||
    value === "verified" ||
    value === "rejected"
  ) {
    return value;
  }

  return "all";
}

export default async function AdminZonesPage({ searchParams }: AdminZonesPageProps) {
  const params = await searchParams;
  const { profile } = await requireStaff("/admin/zona");
  const filters: HealthZoneAdminFilters = {
    contentStatus: parseContentStatus(params.content_status),
    query: params.q?.trim(),
    validationStatus: parseValidationStatus(params.validation_status),
  };
  const result = await getAllHealthZonesForAdmin(filters);
  const pagination = paginateItems(
    result.data ?? [],
    parsePageParam(params.halaman),
    ADMIN_ZONES_PAGE_SIZE,
  );
  const zones = pagination.items;
  const activeFilterCount = [
    filters.query,
    filters.contentStatus !== "all" ? filters.contentStatus : "",
    filters.validationStatus !== "all" ? filters.validationStatus : "",
  ].filter(Boolean).length;
  const resultSummary = result.error
    ? "Filter daftar zona belum dapat dimuat."
    : pagination.totalItems > 0
      ? `Menampilkan ${pagination.startItem}-${pagination.endItem} dari ${pagination.totalItems} zona.`
      : "Tidak ada zona yang cocok dengan filter.";

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          canEditContent(profile.role) ? (
            <AdminActionLink href="/admin/zona/baru" variant="primary">
              Tambah Zona
            </AdminActionLink>
          ) : null
        }
        description="Kelola sembilan zona Kampung Herbal Harmony dan URL QR permanen publik untuk papan fisik."
        eyebrow="Admin Zona"
        title="Zona Kesehatan"
      />

      <AdminNotice message={successMessages[params.success ?? ""]} />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />

      <AdminFilterBar
        activeCount={activeFilterCount}
        resetHref="/admin/zona"
        resultSummary={resultSummary}
        title="Atur filter zona"
      >
        <TextField
          className="lg:w-72"
          defaultValue={filters.query ?? ""}
          label="Cari zona"
          name="q"
          type="search"
        />
        <SelectField
          className="lg:w-48"
          defaultValue={filters.contentStatus ?? "all"}
          label="Status konten"
          name="content_status"
          options={[
            { label: "Semua", value: "all" },
            ...Object.entries(contentLabels).map(([value, label]) => ({
              label,
              value,
            })),
          ]}
        />
        <SelectField
          className="lg:w-48"
          defaultValue={filters.validationStatus ?? "all"}
          label="Status validasi"
          name="validation_status"
          options={[
            { label: "Semua", value: "all" },
            ...Object.entries(validationLabels).map(([value, label]) => ({
              label,
              value,
            })),
          ]}
        />
      </AdminFilterBar>

      {result.error || !result.data ? (
        <AdminEmptyState
          description={result.error ?? "Daftar zona belum dapat dimuat."}
          title="Daftar zona belum dapat dimuat"
        />
      ) : zones.length === 0 ? (
        <AdminEmptyState
          description="Coba ubah kata kunci atau filter status."
          title="Belum ada zona yang cocok"
        />
      ) : (
        <section aria-label="Daftar zona admin" className="grid gap-3">
          {zones.map((zone) => (
            <ZoneAdminCard
              canDelete={canDeleteContent(profile.role)}
              canEdit={canEditContent(profile.role)}
              canWorkflow={canPublishContent(profile.role)}
              key={zone.id}
              zone={zone}
            />
          ))}
        </section>
      )}
      {!result.error && result.data ? (
        <AdminPagination
          currentPage={pagination.currentPage}
          endItem={pagination.endItem}
          params={{
            content_status: filters.contentStatus,
            q: filters.query,
            validation_status: filters.validationStatus,
          }}
          pathname="/admin/zona"
          startItem={pagination.startItem}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      ) : null}
    </div>
  );
}

type ZoneAdminCardProps = {
  canDelete: boolean;
  canEdit: boolean;
  canWorkflow: boolean;
  zone: HealthZoneAdminRecord;
};

function ZoneAdminCard({ canDelete, canEdit, canWorkflow, zone }: ZoneAdminCardProps) {
  return (
    <article className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AdminToneBadge tone="published">{zone.zone_code}</AdminToneBadge>
            <AdminStatusBadge
              contentStatus={zone.content_status}
              validationStatus={zone.validation_status}
            />
            {zone.featured ? <AdminToneBadge tone="neutral">Pilihan</AdminToneBadge> : null}
          </div>
          <h3 className="mt-2 truncate text-lg font-bold text-herbal-ink">
            {zone.zone_name}
          </h3>
          {zone.street_name ? (
            <p className="text-sm font-semibold text-herbal-green">{zone.street_name}</p>
          ) : null}
          {zone.block_ranges.length > 0 ? (
            <p className="mt-1 text-sm text-herbal-muted">Blok {zone.block_ranges.join(", ")}</p>
          ) : null}
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-herbal-muted">
            {zone.short_description}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-herbal-muted">
            QR /qr/zona/{zone.qr_key} &middot; Diperbarui{" "}
            {new Date(zone.updated_at).toLocaleString("id-ID")}
          </p>
        </div>
        <AdminActionBar align="end" className="shrink-0">
          <AdminActionLink href={`/admin/zona/${zone.id}/edit`} variant="secondary">
            {canEdit ? "Edit" : "Lihat"}
          </AdminActionLink>
          {canDelete ? (
            <DeleteConfirmForm
              action={deleteHealthZoneAction}
              entityId={zone.id}
              entityLabel={`Zona "${zone.zone_name}"`}
            />
          ) : null}
        </AdminActionBar>
      </div>
      {canWorkflow ? (
        <div className="mt-4 border-t border-herbal-green/10 pt-4">
          <WorkflowActionMenu
            action={setHealthZoneWorkflowAction}
            entityId={zone.id}
            entityLabel={`zona "${zone.zone_name}"`}
          />
        </div>
      ) : null}
    </article>
  );
}
