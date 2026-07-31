import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { HealthZoneQrPanel } from "@/components/admin/HealthZoneQrPanel";
import { HealthZoneAdminForm } from "@/components/admin/HealthZoneAdminForm";
import { updateHealthZoneAction } from "@/app/admin/(protected)/zona/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { getHealthZoneByIdForAdmin } from "@/lib/data/admin/health-zones";
import { createPageMetadata } from "@/lib/metadata";
import { getHealthZoneQrTarget } from "@/lib/qr/health-zone-qr";

type EditZonePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug atau kode zona sudah digunakan.",
  "kode-permanen": "Kode zona tidak dapat diubah setelah zona pernah dipublikasikan.",
  otorisasi: "Hanya admin yang dapat mengubah zona ini.",
  validasi: "Periksa kembali kode zona, isian wajib, status, dan path gambar.",
};

const successMessages: Record<string, string> = {
  dibuat: "Zona kesehatan berhasil dibuat.",
  diperbarui: "Perubahan zona berhasil disimpan.",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EditZonePageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getHealthZoneByIdForAdmin(id);

  return createPageMetadata({
    title: result.data
      ? `Edit ${result.data.street_name ?? result.data.zone_name}`
      : "Edit Zona",
    description: "Form edit zona kesehatan Kampung Herbal Harmony.",
    path: `/admin/zona/${id}/edit`,
  });
}

export default async function EditZonePage({
  params,
  searchParams,
}: EditZonePageProps) {
  const { id } = await params;
  const query = await searchParams;
  await requireStaff(`/admin/zona/${id}/edit`);
  const result = await getHealthZoneByIdForAdmin(id);

  if (!result.data) {
    notFound();
  }

  const targetUrl = getHealthZoneQrTarget(result.data.qr_key);

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          <AdminStatusBadge
            contentStatus={result.data.content_status}
            validationStatus={result.data.validation_status}
          />
        }
        backHref="/admin/zona"
        backLabel="Kembali ke daftar zona"
        description={`${result.data.street_name ?? result.data.zone_name}. URL QR permanen baru: ${targetUrl}`}
        eyebrow="Admin Zona"
        title="Edit Zona Kesehatan"
      />
      <AdminNotice message={successMessages[query.success ?? ""]} />
      <AdminNotice message={errorMessages[query.error ?? ""]} tone="error" />
      <HealthZoneQrPanel zone={result.data} />
      <HealthZoneAdminForm
        action={updateHealthZoneAction.bind(null, result.data.id)}
        mode="edit"
        zone={result.data}
      />
    </div>
  );
}
