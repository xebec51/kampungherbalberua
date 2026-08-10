import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { TextAreaField, TextField } from "@/components/admin/fields";
import type { HealthConditionAdminDetail } from "@/lib/data/admin/health-conditions";

type HealthConditionAdminFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  healthCondition?: HealthConditionAdminDetail;
  mode: "create" | "edit";
  readOnly?: boolean;
};

function lines(values?: string[]) {
  return values?.join("\n") ?? "";
}

function text(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

export function HealthConditionAdminForm({
  action,
  healthCondition,
  mode,
  readOnly = false,
}: HealthConditionAdminFormProps) {
  const disabled = readOnly;
  const linkedPlantLines = lines(
    healthCondition?.linkedPlants.map((link) => link.display_name),
  );

  return (
    <form action={action} className="grid gap-6">
      <AdminFormSection title="Identitas penyakit">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            defaultValue={text(healthCondition?.slug)}
            disabled={disabled}
            help="Huruf kecil, angka, dan tanda hubung. Contoh: hipertensi."
            label="Slug"
            name="slug"
            required
          />
          <TextField
            defaultValue={text(healthCondition?.name)}
            disabled={disabled}
            label="Nama penyakit"
            name="name"
            required
          />
          <TextField
            defaultValue={text(healthCondition?.sort_order ?? "")}
            disabled={disabled}
            help="Angka bulat positif. Angka lebih kecil tampil lebih dulu di katalog."
            label="Urutan tampil"
            name="sort_order"
            required
          />
        </div>
      </AdminFormSection>

      <AdminFormSection title="Konten penyakit">
        <TextAreaField
          defaultValue={text(healthCondition?.short_description)}
          disabled={disabled}
          help="Satu-dua kalimat, tampil sebagai ringkasan pada kartu katalog."
          label="Ringkasan singkat"
          name="short_description"
          required
          rows={2}
        />
        <TextAreaField
          defaultValue={text(healthCondition?.description)}
          disabled={disabled}
          label="Deskripsi"
          name="description"
          required
          rows={4}
        />
        <TextAreaField
          defaultValue={lines(healthCondition?.benefits)}
          disabled={disabled}
          help="Satu manfaat per baris. Gunakan bahasa yang tidak mengklaim menyembuhkan (mis. &quot;Membantu ...&quot;)."
          label="Manfaat"
          name="benefits"
        />
      </AdminFormSection>

      <AdminFormSection
        description="Satu nama tanaman per baris -- akan otomatis tertaut ke halaman tanaman jika namanya cocok (termasuk nama lain/alias), atau tampil sebagai teks biasa jika belum ada profilnya."
        title="Tanaman terkait"
      >
        <TextAreaField
          defaultValue={linkedPlantLines}
          disabled={disabled}
          help="Contoh: Jahe, Daun Salam, Madu Herbal."
          label="Daftar tanaman"
          name="linked_plants"
          rows={8}
        />
      </AdminFormSection>

      {!disabled ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            type="submit"
          >
            {mode === "create" ? "Simpan penyakit" : "Simpan perubahan"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
