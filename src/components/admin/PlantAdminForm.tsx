import type {
  ContentStatus,
  PlantCategory,
  ValidationStatus,
} from "@/lib/supabase/database.types";
import type { StaffRole } from "@/lib/auth/permissions";
import type { PlantAdminRecord } from "@/lib/data/admin/plants";

type PlantAdminFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "create" | "edit";
  plant?: PlantAdminRecord;
  readOnly?: boolean;
  role: StaffRole;
};

const categoryOptions: Array<{ label: string; value: PlantCategory }> = [
  { label: "Rimpang", value: "rimpang" },
  { label: "Daun", value: "daun" },
  { label: "Bunga", value: "bunga" },
  { label: "Batang", value: "batang" },
  { label: "Lainnya", value: "lainnya" },
];

const contentStatusOptions: Array<{ label: string; value: ContentStatus }> = [
  { label: "Draft", value: "draft" },
  { label: "Pending review", value: "pending_review" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const validationStatusOptions: Array<{ label: string; value: ValidationStatus }> = [
  { label: "Data demonstrasi", value: "data_demonstrasi" },
  { label: "Menunggu verifikasi", value: "pending" },
  { label: "Terverifikasi", value: "verified" },
  { label: "Ditolak", value: "rejected" },
];

function lines(values?: string[]) {
  return values?.join("\n") ?? "";
}

function text(value: string | null | undefined) {
  return value ?? "";
}

function filterContentOptions(role: StaffRole) {
  if (role === "admin") {
    return contentStatusOptions;
  }

  return contentStatusOptions.filter((option) =>
    ["draft", "pending_review"].includes(option.value),
  );
}

function filterValidationOptions(role: StaffRole) {
  if (role === "admin") {
    return validationStatusOptions;
  }

  return validationStatusOptions.filter((option) =>
    ["data_demonstrasi", "pending"].includes(option.value),
  );
}

export function PlantAdminForm({
  action,
  mode,
  plant,
  readOnly = false,
  role,
}: PlantAdminFormProps) {
  const disabled = readOnly || role === "validator";
  const contentOptions = filterContentOptions(role);
  const validationOptions = filterValidationOptions(role);
  const defaultContentStatus = plant?.content_status ?? "draft";
  const defaultValidationStatus = plant?.validation_status ?? "data_demonstrasi";

  return (
    <form action={action} className="grid gap-6">
      {disabled ? (
        <div className="rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-4 text-sm leading-6 text-herbal-brown">
          Mode baca saja. Validator dapat meninjau data, tetapi mutation belum
          tersedia pada sprint ini.
        </div>
      ) : null}

      <section className="grid gap-4 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-herbal-ink">Identitas tanaman</h2>
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
      </section>

      <section className="grid gap-4 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-herbal-ink">Materi edukasi</h2>
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
      </section>

      <section className="grid gap-4 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-herbal-ink">Publikasi</h2>
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
            help="Wajib bila status validasi terverifikasi."
            label="Nama validator"
            name="validator_name"
          />
          <SelectField
            defaultValue={defaultValidationStatus}
            disabled={disabled}
            label="Status validasi"
            name="validation_status"
            options={validationOptions}
          />
          <SelectField
            defaultValue={defaultContentStatus}
            disabled={disabled}
            label="Status konten"
            name="content_status"
            options={contentOptions}
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
      </section>

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

type BaseFieldProps = {
  defaultValue?: string;
  disabled?: boolean;
  help?: string;
  label: string;
  name: string;
  required?: boolean;
};

function fieldClasses() {
  return "min-h-11 rounded-md border border-herbal-green/20 bg-white px-3 py-2 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20 disabled:bg-herbal-soft disabled:text-herbal-muted";
}

function TextField({
  defaultValue,
  disabled,
  help,
  label,
  name,
  required,
}: BaseFieldProps) {
  const helpId = help ? `${name}-help` : undefined;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-herbal-ink" htmlFor={name}>
        {label}
      </label>
      <input
        aria-describedby={helpId}
        className={fieldClasses()}
        defaultValue={defaultValue}
        disabled={disabled}
        id={name}
        name={name}
        required={required}
        type="text"
      />
      {help ? (
        <p className="text-xs leading-5 text-herbal-muted" id={helpId}>
          {help}
        </p>
      ) : null}
    </div>
  );
}

function TextAreaField({
  defaultValue,
  disabled,
  help,
  label,
  name,
  required,
  rows = 4,
}: BaseFieldProps & { rows?: number }) {
  const helpId = help ? `${name}-help` : undefined;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-herbal-ink" htmlFor={name}>
        {label}
      </label>
      <textarea
        aria-describedby={helpId}
        className={`${fieldClasses()} min-h-28 resize-y leading-6`}
        defaultValue={defaultValue}
        disabled={disabled}
        id={name}
        name={name}
        required={required}
        rows={rows}
      />
      {help ? (
        <p className="text-xs leading-5 text-herbal-muted" id={helpId}>
          {help}
        </p>
      ) : null}
    </div>
  );
}

type SelectFieldProps<T extends string> = {
  defaultValue: T;
  disabled?: boolean;
  label: string;
  name: string;
  options: Array<{ label: string; value: T }>;
};

function SelectField<T extends string>({
  defaultValue,
  disabled,
  label,
  name,
  options,
}: SelectFieldProps<T>) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-herbal-ink" htmlFor={name}>
        {label}
      </label>
      <select
        className={fieldClasses()}
        defaultValue={defaultValue}
        disabled={disabled}
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
