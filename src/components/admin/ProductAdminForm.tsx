import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { SelectField, TextAreaField, TextField } from "@/components/admin/fields";
import type { ProductAvailability } from "@/lib/supabase/database.types";
import type { ProductAdminRecord } from "@/lib/data/admin/products";

type ProductAdminFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "create" | "edit";
  product?: ProductAdminRecord;
  readOnly?: boolean;
};

const availabilityOptions: Array<{ label: string; value: ProductAvailability }> = [
  { label: "Tersedia", value: "tersedia" },
  { label: "Terbatas", value: "terbatas" },
  { label: "Habis", value: "habis" },
  { label: "Pesan Khusus", value: "segera-tersedia" },
];

function lines(values?: string[]) {
  return values?.join("\n") ?? "";
}

function text(value: string | null | undefined) {
  return value ?? "";
}

export function ProductAdminForm({
  action,
  mode,
  product,
  readOnly = false,
}: ProductAdminFormProps) {
  const disabled = readOnly;

  return (
    <form action={action} className="grid gap-6">
      <AdminFormSection title="Identitas produk">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            defaultValue={text(product?.slug)}
            disabled={disabled}
            help="Huruf kecil, angka, dan tanda hubung. Contoh: jahe-rempah."
            label="Slug"
            name="slug"
            required
          />
          <TextField
            defaultValue={text(product?.name)}
            disabled={disabled}
            label="Nama produk"
            name="name"
            required
          />
          <TextField
            defaultValue={text(product?.category)}
            disabled={disabled}
            help="Contoh: Minuman herbal, Bahan herbal, Perawatan rumah tangga."
            label="Kategori"
            name="category"
            required
          />
          <TextField
            defaultValue={text(product?.producer_name)}
            disabled={disabled}
            label="Produsen"
            name="producer_name"
            required
          />
          <TextField
            defaultValue={text(product?.whatsapp_number)}
            disabled={disabled}
            help="Opsional. Kosongkan untuk memakai kontak WhatsApp default."
            label="Nomor WhatsApp khusus"
            name="whatsapp_number"
          />
        </div>
      </AdminFormSection>

      <AdminFormSection title="Konten produk">
        <TextAreaField
          defaultValue={text(product?.description)}
          disabled={disabled}
          label="Deskripsi"
          name="description"
          required
          rows={5}
        />
        <TextAreaField
          defaultValue={lines(product?.benefits)}
          disabled={disabled}
          help="Satu manfaat per baris. Gunakan bahasa yang tidak mengklaim menyembuhkan (mis. &quot;Membantu ...&quot;)."
          label="Manfaat"
          name="benefits"
        />
      </AdminFormSection>

      <AdminFormSection
        description="Harga dan satuan boleh dikosongkan bila belum ditentukan -- halaman publik akan menampilkan &quot;Hubungi untuk harga&quot;."
        title="Perdagangan dan tampilan"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            defaultValue={text(product?.price !== null && product?.price !== undefined ? String(product.price) : "")}
            disabled={disabled}
            help="Angka rupiah tanpa titik/koma. Kosongkan bila belum ditentukan."
            label="Harga"
            name="price"
          />
          <TextField
            defaultValue={text(product?.unit)}
            disabled={disabled}
            help="Contoh: per 200g, per botol."
            label="Satuan"
            name="unit"
          />
          <SelectField
            defaultValue={product?.availability ?? "tersedia"}
            disabled={disabled}
            label="Ketersediaan"
            name="availability"
            options={availabilityOptions}
          />
          <TextField
            defaultValue={text(product?.image_path)}
            disabled={disabled}
            help="Opsional. Harus diawali /images/. Foto sampul dari Media Library (di bawah) diprioritaskan bila tersedia."
            label="Path gambar cadangan"
            name="image_path"
          />
        </div>
        <label className="flex items-start gap-3 text-sm font-semibold text-herbal-ink">
          <input
            className="mt-1 h-4 w-4 accent-herbal-green"
            defaultChecked={product?.featured ?? false}
            disabled={disabled}
            name="featured"
            type="checkbox"
          />
          Tampilkan sebagai produk unggulan di beranda
        </label>
      </AdminFormSection>

      {!disabled ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            type="submit"
          >
            {mode === "create" ? "Simpan produk" : "Simpan perubahan"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
