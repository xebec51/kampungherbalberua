import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthConditionAdminForm } from "@/components/admin/HealthConditionAdminForm";
import { updateHealthConditionAction } from "@/app/admin/(protected)/penyakit/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { getHealthConditionByIdForAdmin } from "@/lib/data/admin/health-conditions";
import { createPageMetadata } from "@/lib/metadata";

type EditHealthConditionPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug penyakit sudah dipakai.",
  otorisasi: "Hanya admin yang dapat mengubah penyakit ini.",
  validasi: "Periksa kembali isian wajib dan urutan tampil.",
};

const successMessages: Record<string, string> = {
  dibuat: "Penyakit berhasil dibuat.",
  diperbarui: "Perubahan penyakit berhasil disimpan.",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EditHealthConditionPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getHealthConditionByIdForAdmin(id);

  return createPageMetadata({
    title: result.data ? `Edit ${result.data.name}` : "Edit Penyakit",
    description: "Form edit data Katalog Penyakit Kampung Herbal Berua.",
    path: `/admin/penyakit/${id}/edit`,
  });
}

export default async function EditHealthConditionPage({
  params,
  searchParams,
}: EditHealthConditionPageProps) {
  const { id } = await params;
  const query = await searchParams;
  await requireStaff(`/admin/penyakit/${id}/edit`);
  const result = await getHealthConditionByIdForAdmin(id);

  if (!result.data) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        backHref="/admin/penyakit"
        backLabel="Kembali ke daftar penyakit"
        description={`${result.data.name}. Penyakit langsung tampil publik begitu disimpan.`}
        eyebrow="Admin Katalog Penyakit"
        title="Edit Penyakit"
      />
      <AdminNotice message={successMessages[query.success ?? ""]} />
      <AdminNotice message={errorMessages[query.error ?? ""]} tone="error" />
      <HealthConditionAdminForm
        action={updateHealthConditionAction.bind(null, result.data.id)}
        healthCondition={result.data}
        mode="edit"
      />
    </div>
  );
}
