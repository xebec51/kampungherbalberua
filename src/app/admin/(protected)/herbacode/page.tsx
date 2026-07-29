import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  setHerbaCodeWorkflowAction,
  updateHerbaCodeEntryAction,
} from "@/app/admin/(protected)/herbacode/actions";
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

const contentLabels: Record<ContentStatus, string> = {
  archived: "Archived",
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
};

const validationLabels: Record<ValidationStatus, string> = {
  data_demonstrasi: "Data demonstrasi",
  pending: "Menunggu validasi",
  rejected: "Ditolak",
  verified: "Terverifikasi",
};

const errorMessages: Record<string, string> = {
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
  const canMutate = profile.role === "admin";

  return (
    <div className="grid gap-6">
      <header className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
          HerbaCode
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-normal text-herbal-ink">
          Dashboard HerbaCode
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-herbal-muted">
          Kelola relasi tanaman-zona dari dokumen HerbaCode, termasuk edit isi,
          publikasi, arsip, validasi, pencarian tanaman/zona, dan riwayat
          perubahan.
        </p>
      </header>

      <AdminNotice message={successMessages[query.success ?? ""]} />
      <AdminNotice message={errorMessages[query.error ?? ""]} tone="error" />
      {entriesResult.error ? (
        <AdminNotice message={entriesResult.error} tone="error" />
      ) : null}

      <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_12rem_12rem_auto]">
          <label className="text-sm font-semibold text-herbal-ink">
            Cari tanaman atau zona
            <input
              className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              defaultValue={query.q ?? ""}
              name="q"
            />
          </label>
          <SelectField
            defaultValue={query.content ?? "all"}
            label="Status konten"
            name="content"
            options={[
              ["all", "Semua"],
              ["published", "Published"],
              ["draft", "Draft"],
              ["pending_review", "Pending review"],
              ["archived", "Archived"],
            ]}
          />
          <SelectField
            defaultValue={query.validation ?? "all"}
            label="Status validasi"
            name="validation"
            options={[
              ["all", "Semua"],
              ["pending", "Menunggu"],
              ["verified", "Terverifikasi"],
              ["rejected", "Ditolak"],
              ["data_demonstrasi", "Data demonstrasi"],
            ]}
          />
          <button
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-deep px-4 py-2 text-sm font-bold text-white transition hover:bg-herbal-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            type="submit"
          >
            Cari
          </button>
        </form>
      </section>

      <section className="grid gap-4" aria-label="Daftar entri HerbaCode">
        {entries.map((entry) => (
          <HerbaCodeEntryCard
            canMutate={canMutate}
            entry={entry}
            key={entry.id}
          />
        ))}
        {entries.length === 0 && !entriesResult.error ? (
          <div className="rounded-md border border-herbal-green/10 bg-white p-5 text-sm text-herbal-muted shadow-sm">
            Tidak ada entri HerbaCode yang cocok dengan pencarian.
          </div>
        ) : null}
      </section>

      <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-herbal-ink">Riwayat perubahan</h3>
        {historyResult.error ? (
          <p className="mt-3 text-sm text-herbal-muted">{historyResult.error}</p>
        ) : (
          <ul className="mt-4 grid gap-3 text-sm text-herbal-muted">
            {(historyResult.data ?? []).map((item) => (
              <li
                className="rounded-md border border-herbal-green/10 p-3"
                key={item.id}
              >
                <span className="font-semibold text-herbal-ink">
                  {item.action}
                </span>{" "}
                pada {item.herbacode_plant_zone_entries?.local_name ?? "entri"}{" "}
                di {item.herbacode_plant_zone_entries?.zone_title ?? "zona"} -{" "}
                {new Date(item.created_at).toLocaleString("id-ID")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function HerbaCodeEntryCard({
  canMutate,
  entry,
}: {
  canMutate: boolean;
  entry: HerbaCodeAdminEntry;
}) {
  return (
    <article className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="green">
              {contentLabels[entry.content_status]}
            </StatusBadge>
            <StatusBadge tone="brown">
              {validationLabels[entry.validation_status]}
            </StatusBadge>
          </div>
          <h3 className="mt-3 text-xl font-bold text-herbal-ink">
            {entry.local_name}
          </h3>
          {entry.scientific_name ? (
            <p className="mt-1 text-sm italic text-herbal-muted">
              {entry.scientific_name}
            </p>
          ) : null}
          <p className="mt-2 text-sm font-semibold text-herbal-green">
            {entry.zone_title}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
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
        {canMutate ? <WorkflowForms entry={entry} /> : null}
      </div>

      <details className="mt-5 rounded-md border border-herbal-green/10 bg-herbal-soft p-4">
        <summary className="cursor-pointer text-sm font-bold text-herbal-ink">
          Edit isi HerbaCode
        </summary>
        {canMutate ? (
          <form action={updateHerbaCodeEntryAction} className="mt-4 grid gap-4">
            <input name="id" type="hidden" value={entry.id} />
            <TextField
              defaultValue={entry.local_name}
              label="Nama lokal"
              name="local_name"
              required
            />
            <TextField
              defaultValue={entry.scientific_name ?? ""}
              label="Nama ilmiah"
              name="scientific_name"
            />
            <TextAreaField
              defaultValue={lines(entry.active_compounds)}
              label="Senyawa aktif"
              name="active_compounds"
            />
            <TextAreaField
              defaultValue={lines(entry.benefits)}
              label="Manfaat"
              name="benefits"
            />
            <TextAreaField
              defaultValue={lines(entry.used_parts)}
              label="Bagian digunakan"
              name="used_parts"
            />
            <TextAreaField
              defaultValue={lines(entry.cultivation_techniques)}
              label="Teknik budidaya"
              name="cultivation_techniques"
            />
            <TextAreaField
              defaultValue={lines(entry.preparation_methods)}
              label="Cara pemanfaatan"
              name="preparation_methods"
            />
            <TextAreaField
              defaultValue={lines(entry.warnings)}
              label="Perhatian"
              name="warnings"
            />
            <button
              className="inline-flex min-h-10 w-fit items-center justify-center rounded-md bg-herbal-deep px-4 py-2 text-sm font-bold text-white transition hover:bg-herbal-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              type="submit"
            >
              Simpan HerbaCode
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-herbal-muted">
            Role saat ini hanya dapat membaca data HerbaCode.
          </p>
        )}
      </details>
    </article>
  );
}

function WorkflowForms({ entry }: { entry: HerbaCodeAdminEntry }) {
  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      <WorkflowButton
        entryId={entry.id}
        label="Publish"
        name="content_status"
        value="published"
      />
      <WorkflowButton
        entryId={entry.id}
        label="Archive"
        name="content_status"
        value="archived"
      />
      <WorkflowButton
        entryId={entry.id}
        label="Validasi"
        name="validation_status"
        value="verified"
      />
      <WorkflowButton
        entryId={entry.id}
        label="Tolak"
        name="validation_status"
        value="rejected"
      />
    </div>
  );
}

function WorkflowButton({
  entryId,
  label,
  name,
  value,
}: {
  entryId: string;
  label: string;
  name: "content_status" | "validation_status";
  value: string;
}) {
  return (
    <form action={setHerbaCodeWorkflowAction}>
      <input name="id" type="hidden" value={entryId} />
      <input name={name} type="hidden" value={value} />
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-3 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}

function SelectField({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue: string;
  label: string;
  name: string;
  options: Array<[string, string]>;
}) {
  return (
    <label className="text-sm font-semibold text-herbal-ink">
      {label}
      <select
        className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
        defaultValue={defaultValue}
        name={name}
      >
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  defaultValue,
  label,
  name,
  required = false,
}: {
  defaultValue: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-herbal-ink">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
        defaultValue={defaultValue}
        name={name}
        required={required}
      />
    </label>
  );
}

function TextAreaField({
  defaultValue,
  label,
  name,
}: {
  defaultValue: string;
  label: string;
  name: string;
}) {
  return (
    <label className="text-sm font-semibold text-herbal-ink">
      {label}
      <textarea
        className="mt-2 min-h-24 w-full rounded-md border border-herbal-green/20 bg-white px-3 py-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}

function lines(values: string[]) {
  return values.join("\n");
}
