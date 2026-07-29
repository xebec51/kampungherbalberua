import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  archiveHealthZoneAction,
  deleteHealthZoneAction,
} from "@/app/admin/(protected)/zona/actions";
import { canDeleteContent, canEditContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  getAllHealthZonesForAdmin,
  type HealthZoneAdminFilters,
  type HealthZoneAdminRecord,
} from "@/lib/data/admin/health-zones";
import type { ContentStatus, ValidationStatus } from "@/lib/supabase/database.types";
import { createPageMetadata } from "@/lib/metadata";

type AdminZonesPageProps = {
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
  duplikat: "Slug atau kode zona sudah digunakan.",
  gagal: "Aksi zona belum dapat diproses.",
  hapus: "Penghapusan hanya tersedia untuk admin dan wajib dikonfirmasi.",
  "tidak-ditemukan": "Zona kesehatan tidak ditemukan.",
  otorisasi: "Role Anda tidak memiliki izin untuk aksi tersebut.",
  readonly: "Validator bersifat read-only pada sprint ini.",
  validasi: "Periksa kembali isian zona.",
};

const successMessages: Record<string, string> = {
  diarsipkan: "Zona berhasil diarsipkan.",
  dihapus: "Zona berhasil dihapus.",
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
  const zones = result.data;

  return (
    <div className="grid gap-6">
      <header className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
              Admin Zona
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal text-herbal-ink">
              Zona Kesehatan
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
              Kelola sembilan zona Kampung Herbal Harmony dan URL QR permanen
              publik untuk papan fisik.
            </p>
          </div>
          {canEditContent(profile.role) ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href="/admin/zona/baru"
            >
              Tambah Zona
            </Link>
          ) : null}
        </div>
      </header>

      <AdminNotice message={successMessages[params.success ?? ""]} />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />

      <form className="grid gap-4 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm md:grid-cols-[1fr_12rem_12rem_auto] md:items-end">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-herbal-ink" htmlFor="q">
            Cari zona
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

      {result.error || !zones ? (
        <section className="rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-5 text-sm leading-6 text-herbal-brown shadow-sm">
          {result.error ?? "Daftar zona belum dapat dimuat."}
        </section>
      ) : zones.length === 0 ? (
        <section className="rounded-md border border-herbal-green/10 bg-white p-6 text-sm leading-6 text-herbal-muted shadow-sm">
          Belum ada zona yang cocok dengan filter saat ini.
        </section>
      ) : (
        <section aria-label="Daftar zona admin" className="grid gap-4">
          {zones.map((zone) => (
            <ZoneAdminCard
              canDelete={canDeleteContent(profile.role)}
              canEdit={canEditContent(profile.role)}
              key={zone.id}
              role={profile.role}
              zone={zone}
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

type ZoneAdminCardProps = {
  canDelete: boolean;
  canEdit: boolean;
  role: string;
  zone: HealthZoneAdminRecord;
};

function ZoneAdminCard({ canDelete, canEdit, role, zone }: ZoneAdminCardProps) {
  return (
    <article className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="green">{zone.zone_code}</StatusBadge>
            <StatusBadge tone="green">{contentLabels[zone.content_status]}</StatusBadge>
            <StatusBadge tone="brown">
              {validationLabels[zone.validation_status]}
            </StatusBadge>
            {zone.featured ? <StatusBadge>Featured</StatusBadge> : null}
          </div>
          <h3 className="mt-3 text-xl font-bold text-herbal-ink">
            {zone.zone_name}
          </h3>
          {zone.street_name ? (
            <p className="mt-1 text-sm font-semibold text-herbal-green">
              {zone.street_name}
            </p>
          ) : null}
          {zone.block_ranges.length > 0 ? (
            <p className="mt-2 text-sm text-herbal-muted">
              Blok {zone.block_ranges.join(", ")}
            </p>
          ) : null}
          <p className="mt-3 max-w-3xl text-sm leading-6 text-herbal-muted">
            {zone.short_description}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-herbal-muted">
            QR publik /qr/zona/{zone.qr_key} | Diperbarui{" "}
            {new Date(zone.updated_at).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            href={`/admin/zona/${zone.id}/edit`}
          >
            {canEdit ? "Edit" : "Lihat"}
          </Link>
          {role === "admin" && zone.content_status !== "archived" ? (
            <form action={archiveHealthZoneAction}>
              <input name="id" type="hidden" value={zone.id} />
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
          <form action={deleteHealthZoneAction} className="mt-4 grid gap-3 text-sm text-herbal-brown">
            <input name="id" type="hidden" value={zone.id} />
            <label className="flex items-start gap-3">
              <input
                className="mt-1 h-4 w-4 accent-herbal-brown"
                name="confirm_delete"
                type="checkbox"
                value="permanen"
              />
              Saya memahami penghapusan ini permanen. Arsipkan zona bila data
              masih mungkin diperlukan.
            </label>
            <button
              className="inline-flex min-h-10 w-fit items-center justify-center rounded-md bg-herbal-brown px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#713511] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-green"
              type="submit"
            >
              Hapus Zona
            </button>
          </form>
        </details>
      ) : null}
    </article>
  );
}
