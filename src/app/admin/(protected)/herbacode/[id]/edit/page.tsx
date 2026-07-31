import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { TextAreaField, TextField } from "@/components/admin/fields";
import { updateHerbaCodeEntryAction } from "@/app/admin/(protected)/herbacode/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { getHerbaCodeEntryByIdForAdmin } from "@/lib/data/admin/herbacode";
import { createPageMetadata } from "@/lib/metadata";

type EditHerbaCodeEntryPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

const errorMessages: Record<string, string> = {
  gagal: "Perubahan HerbaCode belum dapat disimpan.",
  otorisasi: "Hanya admin yang dapat mengubah data HerbaCode.",
  validasi: "Nama lokal wajib diisi.",
};

const successMessages: Record<string, string> = {
  diperbarui: "Entri HerbaCode berhasil diperbarui.",
};

function lines(values: string[]) {
  return values.join("\n");
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EditHerbaCodeEntryPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getHerbaCodeEntryByIdForAdmin(id);

  return createPageMetadata({
    title: result.data ? `Edit HerbaCode ${result.data.local_name}` : "Edit HerbaCode",
    description: "Form edit isi entri HerbaCode Kampung Herbal Harmony.",
    path: `/admin/herbacode/${id}/edit`,
  });
}

export default async function EditHerbaCodeEntryPage({
  params,
  searchParams,
}: EditHerbaCodeEntryPageProps) {
  const { id } = await params;
  const query = await searchParams;
  await requireStaff(`/admin/herbacode/${id}/edit`);
  const result = await getHerbaCodeEntryByIdForAdmin(id);

  if (!result.data) {
    notFound();
  }

  const entry = result.data;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          <AdminStatusBadge
            contentStatus={entry.content_status}
            validationStatus={entry.validation_status}
          />
        }
        backHref="/admin/herbacode"
        backLabel="Kembali ke dashboard HerbaCode"
        description={`${entry.local_name} di ${entry.zone_title}. Gunakan aksi validasi di dashboard HerbaCode untuk mengubah status.`}
        eyebrow="HerbaCode"
        title="Edit Isi HerbaCode"
      />

      <AdminNotice message={successMessages[query.success ?? ""]} />
      <AdminNotice message={errorMessages[query.error ?? ""]} tone="error" />

      <form action={updateHerbaCodeEntryAction} className="grid gap-6">
        <input name="id" type="hidden" value={entry.id} />

        <AdminFormSection title="Identitas">
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
        </AdminFormSection>

        <AdminFormSection
          description="Satu poin per baris."
          title="Kandungan dan manfaat"
        >
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
        </AdminFormSection>

        <div>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            type="submit"
          >
            Simpan perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
