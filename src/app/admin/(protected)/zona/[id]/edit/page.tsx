import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { HealthZoneQrPanel } from "@/components/admin/HealthZoneQrPanel";
import { HealthZoneAdminForm } from "@/components/admin/HealthZoneAdminForm";
import { updateHealthZoneAction } from "@/app/admin/(protected)/zona/actions";
import { canEditContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import { getHealthZoneByIdForAdmin } from "@/lib/data/admin/health-zones";
import { absoluteUrl, createPageMetadata } from "@/lib/metadata";

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
  otorisasi: "Role Anda tidak memiliki izin untuk mengubah zona ini.",
  readonly: "Validator bersifat read-only pada sprint ini.",
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
    title: result.data ? `Edit ${result.data.street_name}` : "Edit Zona",
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
  const { profile } = await requireStaff(`/admin/zona/${id}/edit`);
  const result = await getHealthZoneByIdForAdmin(id);

  if (!result.data) {
    notFound();
  }

  const editorLocked =
    profile.role === "editor" &&
    !["draft", "pending_review"].includes(result.data.content_status);
  const readOnly = !canEditContent(profile.role) || editorLocked;
  const targetUrl = absoluteUrl(`/z/${result.data.zone_code}`);

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
          {result.data.street_name}. Target QR permanen saat ini: {targetUrl}
        </p>
      </header>
      <AdminNotice message={successMessages[query.success ?? ""]} />
      <AdminNotice message={errorMessages[query.error ?? ""]} tone="error" />
      {editorLocked ? (
        <AdminNotice
          message="Editor hanya dapat mengubah zona dengan status draft atau pending review."
          tone="error"
        />
      ) : null}
      <HealthZoneQrPanel zone={result.data} />
      <HealthZoneAdminForm
        action={updateHealthZoneAction.bind(null, result.data.id)}
        mode="edit"
        readOnly={readOnly}
        role={profile.role}
        zone={result.data}
      />
    </div>
  );
}
