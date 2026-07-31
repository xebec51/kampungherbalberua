import type { Metadata } from "next";
import Link from "next/link";
import { AdminActionBar, AdminActionLink } from "@/components/admin/AdminActionBar";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { SelectField, TextField } from "@/components/admin/fields";
import { WorkflowActionMenu } from "@/components/admin/WorkflowActionMenu";
import { setHerbaCodeWorkflowAction } from "@/app/admin/(protected)/herbacode/actions";
import { canPublishContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  getHerbaCodeEntriesForAdmin,
  getHerbaCodeHistoryForAdmin,
  type HerbaCodeAdminEntry,
} from "@/lib/data/admin/herbacode";
import { createPageMetadata } from "@/lib/metadata";
import type { ContentStatus, ValidationStatus } from "@/lib/supabase/database.types";

type HerbaCodeAdminPageProps = {
  searchParams: Promise<{
    content?: ContentStatus | "all";
    error?: string;
    q?: string;
    success?: string;
    validation?: ValidationStatus | "all";
  }>;
};

const contentLabels: Record<ContentStatus | "all", string> = {
  all: "Semua",
  archived: "Diarsipkan",
  draft: "Draf",
  pending_review: "Menunggu pemeriksaan",
  published: "Dipublikasikan",
};

const validationLabels: Record<ValidationStatus | "all", string> = {
  all: "Semua",
  data_demonstrasi: "Data demonstrasi",
  pending: "Menunggu pemeriksaan",
  rejected: "Perlu perbaikan",
  verified: "Terverifikasi",
};

const errorMessages: Record<string, string> = {
  alasan: "Alasan wajib diisi saat menandai perlu perbaikan.",
  gagal: "Perubahan HerbaCode belum dapat disimpan.",
  otorisasi: "Hanya admin yang dapat mengubah data HerbaCode.",
  validasi: "Periksa kembali isian HerbaCode.",
};

const successMessages: Record<string, string> = {
  diperbarui: "Entri HerbaCode berhasil diperbarui.",
  status: "Status HerbaCode berhasil diperbarui.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Admin HerbaCode",
  description: "Dashboard pengelolaan data HerbaCode Kampung Herbal Harmony.",
  path: "/admin/herbacode",
});

export default async function HerbaCodeAdminPage({
  searchParams,
}: HerbaCodeAdminPageProps) {
  const query = await searchParams;
  const { profile } = await requireStaff("/admin/herbacode");
  const [entriesResult, historyResult] = await Promise.all([
    getHerbaCodeEntriesForAdmin({
      contentStatus: query.content ?? "all",
      query: query.q,
      validationStatus: query.validation ?? "all",
    }),
    getHerbaCodeHistoryForAdmin(),
  ]);
  const entries = entriesResult.data ?? [];
  const canMutate = canPublishContent(profile.role);

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        description="Kelola relasi tanaman-zona dari dokumen HerbaCode: edit isi, validasi, publikasi, arsip, dan riwayat perubahan."
        eyebrow="HerbaCode"
        title="Dashboard HerbaCode"
      />

      <AdminNotice message={successMessages[query.success ?? ""]} />
      <AdminNotice message={errorMessages[query.error ?? ""]} tone="error" />
      {entriesResult.error ? (
        <AdminNotice message={entriesResult.error} tone="error" />
      ) : null}

      <AdminFilterBar>
        <TextField
          className="lg:w-72"
          defaultValue={query.q ?? ""}
          label="Cari tanaman atau zona"
          name="q"
          type="search"
        />
        <SelectField
          className="lg:w-48"
          defaultValue={query.content ?? "all"}
          label="Status konten"
          name="content"
          options={(Object.keys(contentLabels) as Array<ContentStatus | "all">).map(
            (value) => ({ label: contentLabels[value], value }),
          )}
        />
        <SelectField
          className="lg:w-48"
          defaultValue={query.validation ?? "all"}
          label="Status validasi"
          name="validation"
          options={(
            Object.keys(validationLabels) as Array<ValidationStatus | "all">
          ).map((value) => ({ label: validationLabels[value], value }))}
        />
        <AdminActionBar>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-deep px-4 py-2 text-sm font-bold text-white transition hover:bg-herbal-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            type="submit"
          >
            Cari
          </button>
        </AdminActionBar>
      </AdminFilterBar>

      <section aria-label="Daftar entri HerbaCode" className="grid gap-3">
        {entries.map((entry) => (
          <HerbaCodeEntryCard canMutate={canMutate} entry={entry} key={entry.id} />
        ))}
        {entries.length === 0 && !entriesResult.error ? (
          <AdminEmptyState
            description="Coba ubah kata kunci atau filter status."
            title="Tidak ada entri yang cocok"
          />
        ) : null}
      </section>

      <section className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-bold text-herbal-ink">Riwayat perubahan</h2>
        {historyResult.error ? (
          <p className="mt-3 text-sm text-herbal-muted">{historyResult.error}</p>
        ) : (historyResult.data ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-herbal-muted">Belum ada riwayat perubahan.</p>
        ) : (
          <ul className="mt-4 grid gap-2 text-sm">
            {(historyResult.data ?? []).map((item) => (
              <li
                className="rounded-md border border-herbal-green/10 px-3 py-2 text-herbal-muted"
                key={item.id}
              >
                <span className="font-semibold text-herbal-ink">
                  {historyActionLabels[item.action] ?? item.action}
                </span>{" "}
                &middot; {item.herbacode_plant_zone_entries?.local_name ?? "entri"} di{" "}
                {item.herbacode_plant_zone_entries?.zone_title ?? "zona"} &middot;{" "}
                {new Date(item.created_at).toLocaleString("id-ID")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const historyActionLabels: Record<string, string> = {
  archive: "Diarsipkan",
  edit: "Isi diperbarui",
  publish: "Divalidasi & dipublikasikan",
  reject: "Ditandai perlu perbaikan",
};

function HerbaCodeEntryCard({
  canMutate,
  entry,
}: {
  canMutate: boolean;
  entry: HerbaCodeAdminEntry;
}) {
  return (
    <article className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <AdminStatusBadge
            contentStatus={entry.content_status}
            validationStatus={entry.validation_status}
          />
          <h3 className="mt-2 truncate text-lg font-bold text-herbal-ink">
            {entry.local_name}
          </h3>
          {entry.scientific_name ? (
            <p className="text-sm italic text-herbal-muted">{entry.scientific_name}</p>
          ) : null}
          <p className="mt-1 text-sm font-semibold text-herbal-green">{entry.zone_title}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <Link
              className="font-semibold text-herbal-green hover:underline"
              href={`/tanaman/${entry.plants?.slug ?? entry.plant_id}`}
            >
              Lihat tanaman
            </Link>
            <Link
              className="font-semibold text-herbal-green hover:underline"
              href={`/zona-kesehatan/${entry.health_zones?.slug ?? entry.zone_slug}`}
            >
              Lihat zona
            </Link>
          </div>
        </div>
        <AdminActionBar align="end" className="shrink-0">
          <AdminActionLink href={`/admin/herbacode/${entry.id}/edit`} variant="secondary">
            {canMutate ? "Edit isi" : "Lihat"}
          </AdminActionLink>
        </AdminActionBar>
      </div>
      {canMutate ? (
        <div className="mt-4 border-t border-herbal-green/10 pt-4">
          <WorkflowActionMenu
            action={setHerbaCodeWorkflowAction}
            entityId={entry.id}
            entityLabel={`entri HerbaCode "${entry.local_name}"`}
          />
        </div>
      ) : null}
    </article>
  );
}
