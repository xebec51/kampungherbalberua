import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
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
      <header className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
        <Link
          className="text-sm font-semibold text-herbal-green hover:underline"
          href="/admin/zona"
        >
          Kembali ke daftar zona
        </Link>
        <h2 className="mt-3 text-3xl font-bold tracking-normal text-herbal-ink">
          Edit Zona Kesehatan
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
          {result.data.street_name ?? result.data.zone_name}. URL QR permanen
          baru: {targetUrl}
        </p>
      </header>
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
