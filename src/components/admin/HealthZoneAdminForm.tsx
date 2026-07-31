import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { SelectField, TextAreaField, TextField } from "@/components/admin/fields";
import type {
  ContentStatus,
  ValidationStatus,
} from "@/lib/supabase/database.types";
import type { HealthZoneAdminRecord } from "@/lib/data/admin/health-zones";

type HealthZoneAdminFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "create" | "edit";
  readOnly?: boolean;
  zone?: HealthZoneAdminRecord;
};

const contentStatusOptions: Array<{ label: string; value: ContentStatus }> = [
  { label: "Draf", value: "draft" },
  { label: "Menunggu pemeriksaan", value: "pending_review" },
  { label: "Dipublikasikan", value: "published" },
  { label: "Diarsipkan", value: "archived" },
];

const validationStatusOptions: Array<{ label: string; value: ValidationStatus }> = [
  { label: "Data demonstrasi", value: "data_demonstrasi" },
  { label: "Menunggu pemeriksaan", value: "pending" },
  { label: "Terverifikasi", value: "verified" },
  { label: "Perlu perbaikan", value: "rejected" },
];

function lines(values?: string[]) {
  return values?.join("\n") ?? "";
}

function text(value: string | null | undefined) {
  return value ?? "";
}

export function HealthZoneAdminForm({
  action,
  mode,
  readOnly = false,
  zone,
}: HealthZoneAdminFormProps) {
  const disabled = readOnly;
  const zoneCodeLocked = Boolean(zone?.published_at);

  return (
    <form action={action} className="grid gap-6">
      {zoneCodeLocked ? (
        <div className="rounded-md border border-herbal-green/20 bg-herbal-soft p-4 text-sm leading-6 text-herbal-deep">
          Kode zona sudah permanen karena zona pernah dipublikasikan. Perubahan
          slug tidak mengubah URL QR publik yang sudah dibuat.
        </div>
      ) : null}

      <AdminFormSection title="Identitas zona">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            defaultValue={text(zone?.zone_code)}
            disabled={disabled}
            help="Identitas internal dan kompatibilitas QR lama."
            label="Kode zona"
            name="zone_code"
            readOnly={zoneCodeLocked}
            required
          />
          <TextField
            defaultValue={text(zone?.slug)}
            disabled={disabled}
            help="Slug boleh diperbaiki tanpa mencetak ulang QR."
            label="Slug"
            name="slug"
            required
          />
          <TextField
            defaultValue={zone?.program_name ?? "Kampung Herbal Harmony"}
            disabled={disabled}
            label="Nama program"
            name="program_name"
            required
          />
          <TextField
            defaultValue={text(zone?.street_name)}
            disabled={disabled}
            help="Kosongkan bila data jalan riil belum tersedia."
            label="Nama jalan"
            name="street_name"
          />
          <TextField
            defaultValue={text(zone?.zone_name)}
            disabled={disabled}
            label="Nama zona"
            name="zone_name"
            required
          />
          <TextField
            defaultValue={text(zone?.sign_text)}
            disabled={disabled}
            label="Teks papan"
            name="sign_text"
          />
        </div>
        <TextAreaField
          defaultValue={lines(zone?.block_ranges)}
          disabled={disabled}
          help="Satu blok per baris."
          label="Blok"
          name="block_ranges"
          required
        />
      </AdminFormSection>

      <AdminFormSection title="Materi zona">
        <TextAreaField
          defaultValue={text(zone?.health_topic)}
          disabled={disabled}
          label="Fokus materi"
          name="health_topic"
          required
        />
        <TextAreaField
          defaultValue={text(zone?.short_description)}
          disabled={disabled}
          label="Ringkasan"
          name="short_description"
          required
        />
        <TextAreaField
          defaultValue={text(zone?.overview)}
          disabled={disabled}
          label="Gambaran umum"
          name="overview"
          required
          rows={6}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextAreaField
            defaultValue={lines(zone?.educational_points)}
            disabled={disabled}
            help="Satu poin per baris."
            label="Poin edukasi"
            name="educational_points"
          />
          <TextAreaField
            defaultValue={lines(zone?.healthy_habits)}
            disabled={disabled}
            label="Kebiasaan sehat"
            name="healthy_habits"
          />
          <TextAreaField
            defaultValue={lines(zone?.important_notes)}
            disabled={disabled}
            label="Catatan penting"
            name="important_notes"
          />
          <TextAreaField
            defaultValue={lines(zone?.source_notes)}
            disabled={disabled}
            help="Wajib minimal satu baris bila status terverifikasi."
            label="Catatan sumber"
            name="source_notes"
          />
        </div>
      </AdminFormSection>

      <AdminFormSection
        description="Metadata pemeriksaan ini melengkapi -- bukan menggantikan -- aksi Validasi & Publikasikan di daftar zona."
        title="Publikasi dan validasi"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            defaultValue={text(zone?.image_path)}
            disabled={disabled}
            help="Opsional. Harus diawali /images/."
            label="Path gambar"
            name="image_path"
          />
          <TextField
            defaultValue={text(zone?.location_notes)}
            disabled={disabled}
            label="Catatan lokasi"
            name="location_notes"
          />
          <TextField
            defaultValue={text(zone?.validator_name)}
            disabled={disabled}
            help="Wajib sebelum konten dipublikasikan."
            label="Nama pemeriksa"
            name="validator_name"
          />
          <TextField
            defaultValue={text(zone?.validation_checked_at?.slice(0, 10))}
            disabled={disabled}
            help="Wajib sebelum konten dipublikasikan."
            label="Tanggal pemeriksaan"
            name="validation_checked_at"
            type="date"
          />
          <SelectField
            defaultValue={zone?.validation_status ?? "data_demonstrasi"}
            disabled={disabled}
            label="Status validasi"
            name="validation_status"
            options={validationStatusOptions}
          />
          <SelectField
            defaultValue={zone?.content_status ?? "draft"}
            disabled={disabled}
            label="Status konten"
            name="content_status"
            options={contentStatusOptions}
          />
          <TextAreaField
            defaultValue={text(zone?.validation_notes)}
            disabled={disabled}
            label="Catatan pemeriksaan"
            name="validation_notes"
          />
        </div>
        <label className="flex items-start gap-3 text-sm font-semibold text-herbal-ink">
          <input
            className="mt-1 h-4 w-4 accent-herbal-green"
            defaultChecked={zone?.featured ?? false}
            disabled={disabled}
            name="featured"
            type="checkbox"
          />
          Tampilkan sebagai zona pilihan
        </label>
      </AdminFormSection>

      {!disabled ? (
        <button
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          type="submit"
        >
          {mode === "create" ? "Simpan zona" : "Simpan perubahan"}
        </button>
      ) : null}
    </form>
  );
}
