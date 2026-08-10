import type { Metadata } from "next";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthConditionAdminForm } from "@/components/admin/HealthConditionAdminForm";
import { createHealthConditionAction } from "@/app/admin/(protected)/penyakit/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { createPageMetadata } from "@/lib/metadata";

type NewHealthConditionPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug penyakit sudah dipakai.",
  otorisasi: "Hanya admin yang dapat membuat penyakit.",
  validasi: "Periksa kembali isian wajib dan urutan tampil.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Tambah Penyakit",
  description: "Form tambah data Katalog Penyakit Kampung Herbal Berua.",
  path: "/admin/penyakit/baru",
});

export default async function NewHealthConditionPage({
  searchParams,
}: NewHealthConditionPageProps) {
  const params = await searchParams;
  await requireStaff("/admin/penyakit/baru");

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        backHref="/admin/penyakit"
        backLabel="Kembali ke daftar penyakit"
        description="Penyakit langsung tampil publik begitu disimpan -- tidak ada alur draf atau publikasi."
        eyebrow="Admin Katalog Penyakit"
        title="Tambah Penyakit"
      />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />
      <HealthConditionAdminForm action={createHealthConditionAction} mode="create" />
    </div>
  );
}
