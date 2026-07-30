import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/admin/AdminNotice";
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
      <header className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm">
        <Link
          className="text-sm font-semibold text-herbal-green hover:underline"
          href="/admin/tanaman"
        >
          Kembali ke daftar tanaman
        </Link>
        <h2 className="mt-3 text-3xl font-bold tracking-normal text-herbal-ink">
          Tambah Tanaman
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
          Admin mengelola data tanaman, metadata pemeriksaan, validasi, dan
          status publikasi.
        </p>
      </header>
      <AdminNotice message={errorMessages[params.error ?? ""]} tone="error" />
      <PlantAdminForm action={createPlantAction} mode="create" />
    </div>
  );
}
