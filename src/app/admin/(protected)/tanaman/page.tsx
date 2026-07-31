import type { Metadata } from "next";
import { AdminActionBar, AdminActionLink } from "@/components/admin/AdminActionBar";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge, AdminToneBadge } from "@/components/admin/AdminStatusBadge";
import { DeleteConfirmForm } from "@/components/admin/DeleteConfirmForm";
import { SelectField, TextField } from "@/components/admin/fields";
import { WorkflowActionMenu } from "@/components/admin/WorkflowActionMenu";
import {
  deletePlantAction,
  setPlantWorkflowAction,
} from "@/app/admin/(protected)/tanaman/actions";
import { canDeleteContent, canEditContent, canPublishContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  getAllPlantsForAdmin,
  type PlantAdminFilters,
  type PlantAdminRecord,
} from "@/lib/data/admin/plants";
import type { ContentStatus, ValidationStatus } from "@/lib/supabase/database.types";
import { createPageMetadata } from "@/lib/metadata";

type AdminPlantsPageProps = {
  searchParams: Promise<{
    content_status?: string;
    error?: string;
    q?: string;
    success?: string;
    validation_status?: string;
  }>;
};

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
  duplikat: "Slug atau kode tanaman sudah digunakan.",
  gagal: "Aksi tanaman belum dapat diproses.",
  hapus: "Penghapusan hanya tersedia untuk admin dan wajib dikonfirmasi.",
  "tidak-ditemukan": "Tanaman tidak ditemukan.",
  "tidak-lengkap":
    "Tanaman belum lengkap untuk dipublikasikan. Lengkapi catatan sumber dan isian wajib lain di halaman edit.",
  otorisasi: "Hanya admin yang dapat menjalankan aksi tersebut.",
  validasi: "Periksa kembali isian tanaman.",
};

const successMessages: Record<string, string> = {
  diarsipkan: "Tanaman berhasil diarsipkan.",
  dihapus: "Tanaman berhasil dihapus.",
  dipublikasikan: "Tanaman berhasil divalidasi dan dipublikasikan.",
  "perlu-perbaikan": "Tanaman ditandai perlu perbaikan.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Tanaman",
  description: "Daftar dan pengelolaan data tanaman Kampung Herbal Berua.",
  path: "/admin/tanaman",
});

function parseContentStatus(value?: string): PlantAdminFilters["contentStatus"] {
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

function parseValidationStatus(value?: string): PlantAdminFilters["validationStatus"] {
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

export default async function AdminPlantsPage({
  searchParams,
}: AdminPlantsPageProps) {
  const params = await searchParams;
  const { profile } = await requireStaff("/admin/tanaman");
  const filters: PlantAdminFilters = {
    contentStatus: parseContentStatus(params.content_status),
    query: params.q?.trim(),
    validationStatus: parseValidationStatus(params.validation_status),
  };
  const result = await getAllPlantsForAdmin(filters);
  const plants = result.data;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          canEditContent(profile.role) ? (
            <AdminActionLink href="/admin/tanaman/baru" variant="primary">
              Tambah Tanaman
            </AdminActionLink>
          ) : null
        }
        description="Kelola katalog tanaman melalui Supabase. Halaman admin tidak memakai fallback data lokal."
        eyebrow="Admin Tanaman"
        title="Daftar Tanaman"
      />

      <AdminNotice message={successMessages[params.success ?? ""]} />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />

      <AdminFilterBar>
        <TextField
          className="lg:w-72"
          defaultValue={params.q ?? ""}
          label="Cari tanaman"
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
        <AdminActionBar>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            type="submit"
          >
            Terapkan
          </button>
        </AdminActionBar>
      </AdminFilterBar>

      {result.error || !plants ? (
        <AdminEmptyState
          description={result.error ?? "Daftar tanaman belum dapat dimuat."}
          title="Daftar tanaman belum dapat dimuat"
        />
      ) : plants.length === 0 ? (
        <AdminEmptyState
          description="Coba ubah kata kunci atau filter status."
          title="Belum ada tanaman yang cocok"
        />
      ) : (
        <section aria-label="Daftar tanaman admin" className="grid gap-3">
          {plants.map((plant) => (
            <PlantAdminCard
              canArchive={canPublishContent(profile.role)}
              canDelete={canDeleteContent(profile.role)}
              canEdit={canEditContent(profile.role)}
              key={plant.id}
              plant={plant}
            />
          ))}
        </section>
      )}
    </div>
  );
}

type PlantAdminCardProps = {
  canArchive: boolean;
  canDelete: boolean;
  canEdit: boolean;
  plant: PlantAdminRecord;
};

function PlantAdminCard({
  canArchive,
  canDelete,
  canEdit,
  plant,
}: PlantAdminCardProps) {
  return (
    <article className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AdminStatusBadge
              contentStatus={plant.content_status}
              validationStatus={plant.validation_status}
            />
            {plant.featured ? (
              <AdminToneBadge tone="neutral">Pilihan</AdminToneBadge>
            ) : null}
          </div>
          <h3 className="mt-2 truncate text-lg font-bold text-herbal-ink">
            {plant.local_name}
          </h3>
          <p className="text-xs text-herbal-muted">/tanaman/{plant.slug}</p>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-herbal-muted">
            {plant.short_description}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-herbal-muted">
            Diperbarui {new Date(plant.updated_at).toLocaleString("id-ID")}
          </p>
        </div>
        <AdminActionBar align="end" className="shrink-0">
          <AdminActionLink href={`/admin/tanaman/${plant.id}/edit`} variant="secondary">
            {canEdit ? "Edit" : "Lihat"}
          </AdminActionLink>
          {canDelete ? (
            <DeleteConfirmForm
              action={deletePlantAction}
              entityId={plant.id}
              entityLabel={`Tanaman "${plant.local_name}"`}
            />
          ) : null}
        </AdminActionBar>
      </div>
      {canArchive ? (
        <div className="mt-4 border-t border-herbal-green/10 pt-4">
          <WorkflowActionMenu
            action={setPlantWorkflowAction}
            entityId={plant.id}
            entityLabel={`tanaman "${plant.local_name}"`}
          />
        </div>
      ) : null}
    </article>
  );
}
