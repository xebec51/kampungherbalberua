import type {
  ContentStatus,
  ValidationStatus,
} from "@/lib/supabase/database.types";
import type { StaffRole } from "@/lib/auth/permissions";
import type { HealthZoneAdminRecord } from "@/lib/data/admin/health-zones";

type HealthZoneAdminFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "create" | "edit";
  readOnly?: boolean;
  role: StaffRole;
  zone?: HealthZoneAdminRecord;
};

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

function contentOptions(role: StaffRole) {
  if (role === "admin") {
    return contentStatusOptions;
  }

  return contentStatusOptions.filter((option) =>
    ["draft", "pending_review"].includes(option.value),
  );
}

function validationOptions(role: StaffRole) {
  if (role === "admin") {
    return validationStatusOptions;
  }

  return validationStatusOptions.filter((option) =>
    ["data_demonstrasi", "pending"].includes(option.value),
  );
}

export function HealthZoneAdminForm({
  action,
  mode,
  readOnly = false,
  role,
  zone,
}: HealthZoneAdminFormProps) {
  const disabled = readOnly || role === "validator";
  const zoneCodeLocked = Boolean(zone?.published_at);

  return (
    <form action={action} className="grid gap-6">
      {disabled ? (
        <div className="rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-4 text-sm leading-6 text-herbal-brown">
          Mode baca saja. Validator dapat meninjau data, tetapi mutation belum
          tersedia pada sprint ini.
        </div>
      ) : null}
      {zoneCodeLocked ? (
        <div className="rounded-md border border-herbal-green/20 bg-herbal-soft p-4 text-sm leading-6 text-herbal-deep">
          Kode zona sudah permanen karena zona pernah dipublikasikan. Perubahan
          slug tidak mengubah target QR.
        </div>
      ) : null}

      <section className="grid gap-4 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-herbal-ink">Identitas zona</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            defaultValue={text(zone?.zone_code)}
            disabled={disabled}
            help="Format permanen untuk QR, misalnya khb-z01."
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
            label="Nama jalan"
            name="street_name"
            help="Kosongkan bila data jalan riil belum tersedia."
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
      </section>

      <section className="grid gap-4 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-herbal-ink">Materi zona</h2>
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
      </section>

      <section className="grid gap-4 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-herbal-ink">Publikasi</h2>
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
            help="Wajib bila status validasi terverifikasi."
            label="Nama validator"
            name="validator_name"
          />
          <SelectField
            defaultValue={zone?.validation_status ?? "data_demonstrasi"}
            disabled={disabled}
            label="Status validasi"
            name="validation_status"
            options={validationOptions(role)}
          />
          <SelectField
            defaultValue={zone?.content_status ?? "draft"}
            disabled={disabled}
            label="Status konten"
            name="content_status"
            options={contentOptions(role)}
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
      </section>

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

type BaseFieldProps = {
  defaultValue?: string;
  disabled?: boolean;
  help?: string;
  label: string;
  name: string;
  readOnly?: boolean;
  required?: boolean;
};

function fieldClasses() {
  return "min-h-11 rounded-md border border-herbal-green/20 bg-white px-3 py-2 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20 disabled:bg-herbal-soft disabled:text-herbal-muted read-only:bg-herbal-soft";
}

function TextField({
  defaultValue,
  disabled,
  help,
  label,
  name,
  readOnly,
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
        readOnly={readOnly}
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
