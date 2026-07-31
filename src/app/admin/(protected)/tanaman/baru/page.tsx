import type { Metadata } from "next";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PlantAdminForm } from "@/components/admin/PlantAdminForm";
import { createPlantAction } from "@/app/admin/(protected)/tanaman/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { createPageMetadata } from "@/lib/metadata";

type NewPlantPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug atau kode tanaman sudah digunakan.",
  otorisasi: "Hanya admin yang dapat membuat tanaman.",
  validasi: "Periksa kembali isian wajib, status, dan path gambar.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Tambah Tanaman",
  description: "Form tambah data tanaman Kampung Herbal Berua.",
  path: "/admin/tanaman/baru",
});

export default async function NewPlantPage({ searchParams }: NewPlantPageProps) {
  const params = await searchParams;
  await requireStaff("/admin/tanaman/baru");

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        backHref="/admin/tanaman"
        backLabel="Kembali ke daftar tanaman"
        description="Admin mengelola data tanaman, metadata pemeriksaan, validasi, dan status publikasi."
        eyebrow="Admin Tanaman"
        title="Tambah Tanaman"
      />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />
      <PlantAdminForm action={createPlantAction} mode="create" />
    </div>
  );
}
