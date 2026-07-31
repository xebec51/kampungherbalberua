import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { SelectField, TextAreaField, TextField } from "@/components/admin/fields";
import type {
  ContentStatus,
  PlantCategory,
  ValidationStatus,
} from "@/lib/supabase/database.types";
import type { PlantAdminRecord } from "@/lib/data/admin/plants";

type PlantAdminFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "create" | "edit";
  plant?: PlantAdminRecord;
  readOnly?: boolean;
};

const categoryOptions: Array<{ label: string; value: PlantCategory }> = [
  { label: "Rimpang", value: "rimpang" },
  { label: "Daun", value: "daun" },
  { label: "Bunga", value: "bunga" },
  { label: "Batang", value: "batang" },
  { label: "Lainnya", value: "lainnya" },
];

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

export function PlantAdminForm({
  action,
  mode,
  plant,
  readOnly = false,
}: PlantAdminFormProps) {
  const disabled = readOnly;
  const defaultContentStatus = plant?.content_status ?? "draft";
  const defaultValidationStatus = plant?.validation_status ?? "data_demonstrasi";

  return (
    <form action={action} className="grid gap-6">
      <AdminFormSection title="Identitas tanaman">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            defaultValue={text(plant?.plant_code)}
            disabled={disabled}
            help="Opsional. Gunakan kode internal bila tersedia."
            label="Kode tanaman"
            name="plant_code"
          />
          <TextField
            defaultValue={text(plant?.slug)}
            disabled={disabled}
            help="Huruf kecil, angka, dan tanda hubung. Contoh: jahe-merah."
            label="Slug"
            name="slug"
            required
          />
          <TextField
            defaultValue={text(plant?.local_name)}
            disabled={disabled}
            label="Nama lokal"
            name="local_name"
            required
          />
          <TextField
            defaultValue={text(plant?.scientific_name)}
            disabled={disabled}
            label="Nama ilmiah"
            name="scientific_name"
          />
        </div>
        <TextAreaField
          defaultValue={lines(plant?.other_names)}
          disabled={disabled}
          help="Satu nama per baris."
          label="Nama lain"
          name="other_names"
        />
        <SelectField
          defaultValue={plant?.category ?? "rimpang"}
          disabled={disabled}
          label="Kategori"
          name="category"
          options={categoryOptions}
        />
      </AdminFormSection>

      <AdminFormSection title="Materi edukasi">
        <TextAreaField
          defaultValue={text(plant?.short_description)}
          disabled={disabled}
          label="Ringkasan"
          name="short_description"
          required
        />
        <TextAreaField
          defaultValue={text(plant?.description)}
          disabled={disabled}
          label="Deskripsi"
          name="description"
          required
          rows={6}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextAreaField
            defaultValue={lines(plant?.used_parts)}
            disabled={disabled}
            help="Satu bagian per baris."
            label="Bagian yang dimanfaatkan"
            name="used_parts"
          />
          <TextAreaField
            defaultValue={lines(plant?.traditional_uses)}
            disabled={disabled}
            help="Gunakan bahasa pemanfaatan tradisional."
            label="Pemanfaatan tradisional"
            name="traditional_uses"
          />
          <TextAreaField
            defaultValue={lines(plant?.preparation)}
            disabled={disabled}
            label="Cara pengolahan umum"
            name="preparation"
          />
          <TextAreaField
            defaultValue={lines(plant?.care_instructions)}
            disabled={disabled}
            label="Cara perawatan"
            name="care_instructions"
          />
          <TextAreaField
            defaultValue={lines(plant?.warnings)}
            disabled={disabled}
            label="Peringatan"
            name="warnings"
          />
          <TextAreaField
            defaultValue={text(plant?.source_notes)}
            disabled={disabled}
            label="Catatan sumber"
            name="source_notes"
          />
        </div>
      </AdminFormSection>

      <AdminFormSection
        description="Metadata pemeriksaan ini melengkapi -- bukan menggantikan -- aksi Validasi & Publikasikan di daftar tanaman."
        title="Publikasi dan validasi"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            defaultValue={text(plant?.image_path)}
            disabled={disabled}
            help="Opsional. Harus diawali /images/."
            label="Path gambar"
            name="image_path"
          />
          <TextField
            defaultValue={text(plant?.location_status)}
            disabled={disabled}
            label="Status lokasi"
            name="location_status"
          />
          <TextField
            defaultValue={text(plant?.validator_name)}
            disabled={disabled}
            help="Wajib sebelum konten dipublikasikan."
            label="Nama pemeriksa"
            name="validator_name"
          />
          <TextField
            defaultValue={text(plant?.validation_checked_at?.slice(0, 10))}
            disabled={disabled}
            help="Wajib sebelum konten dipublikasikan."
            label="Tanggal pemeriksaan"
            name="validation_checked_at"
            type="date"
          />
          <SelectField
            defaultValue={defaultValidationStatus}
            disabled={disabled}
            label="Status validasi"
            name="validation_status"
            options={validationStatusOptions}
          />
          <SelectField
            defaultValue={defaultContentStatus}
            disabled={disabled}
            label="Status konten"
            name="content_status"
            options={contentStatusOptions}
          />
          <TextAreaField
            defaultValue={text(plant?.validation_notes)}
            disabled={disabled}
            label="Catatan pemeriksaan"
            name="validation_notes"
          />
        </div>
        <label className="flex items-start gap-3 text-sm font-semibold text-herbal-ink">
          <input
            className="mt-1 h-4 w-4 accent-herbal-green"
            defaultChecked={plant?.featured ?? false}
            disabled={disabled}
            name="featured"
            type="checkbox"
          />
          Tampilkan sebagai tanaman pilihan
        </label>
      </AdminFormSection>

      {!disabled ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            type="submit"
          >
            {mode === "create" ? "Simpan tanaman" : "Simpan perubahan"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
