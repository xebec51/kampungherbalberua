import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { ProductAdminForm } from "@/components/admin/ProductAdminForm";
import {
  updateProductAction,
  uploadProductPhotoAction,
} from "@/app/admin/(protected)/produk/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { getProductByIdForAdmin } from "@/lib/data/admin/products";
import { getContentMediaSlotMap } from "@/lib/data/media";
import { createPageMetadata } from "@/lib/metadata";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug produk sudah dipakai.",
  "foto-format": "Format foto tidak dikenali. Gunakan JPEG, PNG, atau WebP.",
  "foto-gagal": "Foto belum dapat diunggah. Coba lagi.",
  "foto-kosong": "Pilih file foto terlebih dahulu.",
  "foto-ukuran": "Ukuran foto terlalu besar setelah dikompres.",
  otorisasi: "Hanya admin yang dapat mengubah produk ini.",
  validasi: "Periksa kembali isian wajib dan harga.",
};

const successMessages: Record<string, string> = {
  dibuat: "Produk berhasil dibuat.",
  diperbarui: "Perubahan produk berhasil disimpan.",
  "foto-diperbarui": "Foto produk berhasil diunggah.",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getProductByIdForAdmin(id);

  return createPageMetadata({
    title: result.data ? `Edit ${result.data.name}` : "Edit Produk",
    description: "Form edit data produk warga Kampung Herbal Berua.",
    path: `/admin/produk/${id}/edit`,
  });
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id } = await params;
  const query = await searchParams;
  await requireStaff(`/admin/produk/${id}/edit`);
  const result = await getProductByIdForAdmin(id);

  if (!result.data) {
    notFound();
  }

  const mediaByProductId = await getContentMediaSlotMap("product", [result.data.id]);
  const currentMedia = mediaByProductId.get(result.data.id) ?? null;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        backHref="/admin/produk"
        backLabel="Kembali ke daftar produk"
        description={`${result.data.name}. Produk langsung tampil publik begitu disimpan.`}
        eyebrow="Admin Produk"
        title="Edit Produk"
      />
      <AdminNotice message={successMessages[query.success ?? ""]} />
      <AdminNotice message={errorMessages[query.error ?? ""]} tone="error" />
      <PhotoUploadForm
        action={uploadProductPhotoAction}
        currentMedia={currentMedia}
        entityId={result.data.id}
        entityLabel={result.data.name}
        fallbackVariant="product"
      />
      <ProductAdminForm
        action={updateProductAction.bind(null, result.data.id)}
        mode="edit"
        product={result.data}
      />
    </div>
  );
}
