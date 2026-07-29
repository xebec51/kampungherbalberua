import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { HealthZoneAdminForm } from "@/components/admin/HealthZoneAdminForm";
import { createHealthZoneAction } from "@/app/admin/(protected)/zona/actions";
import { canEditContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import { createPageMetadata } from "@/lib/metadata";

type NewZonePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug atau kode zona sudah digunakan.",
  otorisasi: "Role Anda tidak memiliki izin untuk membuat zona.",
  readonly: "Validator bersifat read-only pada sprint ini.",
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
  const { profile } = await requireStaff("/admin/zona/baru");

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
          Tambah Zona Kesehatan
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
          Kode zona dipakai sebagai identitas internal dan kompatibilitas QR
          lama. URL QR publik baru dibuat otomatis dari kunci QR permanen yang
          terpisah dari slug halaman.
        </p>
      </header>
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />
      {canEditContent(profile.role) ? (
        <HealthZoneAdminForm
          action={createHealthZoneAction}
          mode="create"
          role={profile.role}
        />
      ) : (
        <AdminNotice message={errorMessages.readonly} tone="error" />
      )}
    </div>
  );
}
