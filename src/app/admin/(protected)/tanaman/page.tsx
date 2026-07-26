import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  archivePlantAction,
  deletePlantAction,
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
  archived: "Archived",
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
};

const validationLabels: Record<ValidationStatus, string> = {
  data_demonstrasi: "Data demonstrasi",
  pending: "Menunggu verifikasi",
  rejected: "Ditolak",
  verified: "Terverifikasi",
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug atau kode tanaman sudah digunakan.",
  gagal: "Aksi tanaman belum dapat diproses.",
  hapus: "Penghapusan hanya tersedia untuk admin dan wajib dikonfirmasi.",
  "tidak-ditemukan": "Tanaman tidak ditemukan.",
  otorisasi: "Role Anda tidak memiliki izin untuk aksi tersebut.",
  readonly: "Validator bersifat read-only pada sprint ini.",
  validasi: "Periksa kembali isian tanaman.",
};

const successMessages: Record<string, string> = {
  diarsipkan: "Tanaman berhasil diarsipkan.",
  dihapus: "Tanaman berhasil dihapus.",
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
      <header className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
              Admin Tanaman
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal text-herbal-ink">
              Daftar Tanaman
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
              Kelola katalog tanaman melalui Supabase. Halaman admin tidak
              memakai fallback data lokal.
            </p>
          </div>
          {canEditContent(profile.role) ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href="/admin/tanaman/baru"
            >
              Tambah Tanaman
            </Link>
          ) : null}
        </div>
      </header>

      <AdminNotice message={successMessages[params.success ?? ""]} />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />

      <form className="grid gap-4 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm md:grid-cols-[1fr_12rem_12rem_auto] md:items-end">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-herbal-ink" htmlFor="q">
            Cari tanaman
          </label>
          <input
            className="min-h-11 rounded-md border border-herbal-green/20 bg-white px-3 py-2 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
            defaultValue={params.q ?? ""}
            id="q"
            name="q"
            type="search"
          />
        </div>
        <FilterSelect
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
        <FilterSelect
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
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          type="submit"
        >
          Terapkan
        </button>
      </form>

      {result.error || !plants ? (
        <section className="rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-5 text-sm leading-6 text-herbal-brown shadow-sm">
          {result.error ?? "Daftar tanaman belum dapat dimuat."}
        </section>
      ) : plants.length === 0 ? (
        <section className="rounded-md border border-herbal-green/10 bg-white p-6 text-sm leading-6 text-herbal-muted shadow-sm">
          Belum ada tanaman yang cocok dengan filter saat ini.
        </section>
      ) : (
        <section aria-label="Daftar tanaman admin" className="grid gap-4">
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

type FilterSelectProps = {
  defaultValue: string;
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
};

function FilterSelect({ defaultValue, label, name, options }: FilterSelectProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-herbal-ink" htmlFor={name}>
        {label}
      </label>
      <select
        className="min-h-11 rounded-md border border-herbal-green/20 bg-white px-3 py-2 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
        defaultValue={defaultValue}
        id={name}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
    <article className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="green">{contentLabels[plant.content_status]}</StatusBadge>
            <StatusBadge tone="brown">
              {validationLabels[plant.validation_status]}
            </StatusBadge>
            {plant.featured ? <StatusBadge>Featured</StatusBadge> : null}
          </div>
          <h3 className="mt-3 text-xl font-bold text-herbal-ink">
            {plant.local_name}
          </h3>
          <p className="mt-1 text-sm text-herbal-muted">
            /tanaman/{plant.slug}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-herbal-muted">
            {plant.short_description}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-herbal-muted">
            Diperbarui {new Date(plant.updated_at).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            href={`/admin/tanaman/${plant.id}/edit`}
          >
            {canEdit ? "Edit" : "Lihat"}
          </Link>
          {canArchive && plant.content_status !== "archived" ? (
            <form action={archivePlantAction}>
              <input name="id" type="hidden" value={plant.id} />
              <button
                className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-herbal-brown px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#713511] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-green"
                type="submit"
              >
                Arsipkan
              </button>
            </form>
          ) : null}
        </div>
      </div>
      {canDelete ? (
        <details className="mt-4 rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-4">
          <summary className="cursor-pointer text-sm font-bold text-herbal-brown">
            Hapus permanen
          </summary>
          <form action={deletePlantAction} className="mt-4 grid gap-3 text-sm text-herbal-brown">
            <input name="id" type="hidden" value={plant.id} />
            <label className="flex items-start gap-3">
              <input
                className="mt-1 h-4 w-4 accent-herbal-brown"
                name="confirm_delete"
                type="checkbox"
                value="permanen"
              />
              Saya memahami penghapusan ini permanen. Arsipkan tanaman bila data
              masih mungkin diperlukan.
            </label>
            <button
              className="inline-flex min-h-10 w-fit items-center justify-center rounded-md bg-herbal-brown px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#713511] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-green"
              type="submit"
            >
              Hapus Tanaman
            </button>
          </form>
        </details>
      ) : null}
    </article>
  );
}
