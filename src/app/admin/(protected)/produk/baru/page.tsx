import type { Metadata } from "next";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductAdminForm } from "@/components/admin/ProductAdminForm";
import { createProductAction } from "@/app/admin/(protected)/produk/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { createPageMetadata } from "@/lib/metadata";

type NewProductPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug produk sudah dipakai.",
  otorisasi: "Hanya admin yang dapat membuat produk.",
  validasi: "Periksa kembali isian wajib dan harga.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Tambah Produk",
  description: "Form tambah data produk warga Kampung Herbal Berua.",
  path: "/admin/produk/baru",
});

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const params = await searchParams;
  await requireStaff("/admin/produk/baru");

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        backHref="/admin/produk"
        backLabel="Kembali ke daftar produk"
        description="Produk langsung tampil publik begitu disimpan -- tidak ada alur draf atau publikasi."
        eyebrow="Admin Produk"
        title="Tambah Produk"
      />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />
      <ProductAdminForm action={createProductAction} mode="create" />
    </div>
  );
}
