import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { PlantAdminForm } from "@/components/admin/PlantAdminForm";
import { updatePlantAction } from "@/app/admin/(protected)/tanaman/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { getPlantByIdForAdmin } from "@/lib/data/admin/plants";
import { createPageMetadata } from "@/lib/metadata";

type EditPlantPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  duplikat: "Slug atau kode tanaman sudah digunakan.",
  otorisasi: "Hanya admin yang dapat mengubah tanaman ini.",
  validasi: "Periksa kembali isian wajib, status, dan path gambar.",
};

const successMessages: Record<string, string> = {
  dibuat: "Tanaman berhasil dibuat.",
  diperbarui: "Perubahan tanaman berhasil disimpan.",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EditPlantPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPlantByIdForAdmin(id);

  return createPageMetadata({
    title: result.data ? `Edit ${result.data.local_name}` : "Edit Tanaman",
    description: "Form edit data tanaman Kampung Herbal Berua.",
    path: `/admin/tanaman/${id}/edit`,
  });
}

export default async function EditPlantPage({
  params,
  searchParams,
}: EditPlantPageProps) {
  const { id } = await params;
  const query = await searchParams;
  await requireStaff(`/admin/tanaman/${id}/edit`);
  const result = await getPlantByIdForAdmin(id);

  if (!result.data) {
    notFound();
  }

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
          Edit Tanaman
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
          {result.data.local_name}. Metadata pembuat, pengubah, pemeriksa, dan
          waktu publikasi ditetapkan oleh server.
        </p>
      </header>
      <AdminNotice message={successMessages[query.success ?? ""]} />
      <AdminNotice message={errorMessages[query.error ?? ""]} tone="error" />
      <PlantAdminForm
        action={updatePlantAction.bind(null, result.data.id)}
        mode="edit"
        plant={result.data}
      />
    </div>
  );
}
