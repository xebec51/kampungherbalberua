import type { Metadata } from "next";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthZoneAdminForm } from "@/components/admin/HealthZoneAdminForm";
import { createHealthZoneAction } from "@/app/admin/(protected)/zona/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { createPageMetadata } from "@/lib/metadata";

type NewZonePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug atau kode zona sudah digunakan.",
  otorisasi: "Hanya admin yang dapat membuat zona.",
  validasi: "Periksa kembali kode zona, isian wajib, status, dan path gambar.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Tambah Zona",
  description: "Form tambah zona kesehatan Kampung Herbal Harmony.",
  path: "/admin/zona/baru",
});

export default async function NewZonePage({ searchParams }: NewZonePageProps) {
  const params = await searchParams;
  await requireStaff("/admin/zona/baru");

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        backHref="/admin/zona"
        backLabel="Kembali ke daftar zona"
        description="Kode zona dipakai sebagai identitas internal dan kompatibilitas QR lama. URL QR publik baru dibuat otomatis dari kunci QR permanen yang terpisah dari slug halaman."
        eyebrow="Admin Zona"
        title="Tambah Zona Kesehatan"
      />
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />
      <HealthZoneAdminForm action={createHealthZoneAction} mode="create" />
    </div>
  );
}
