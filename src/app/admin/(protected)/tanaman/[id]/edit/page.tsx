import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { PlantAdminForm } from "@/components/admin/PlantAdminForm";
import {
  updatePlantAction,
  uploadPlantPhotoAction,
} from "@/app/admin/(protected)/tanaman/actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { getPlantByIdForAdmin } from "@/lib/data/admin/plants";
import { getPrimaryPlantMediaMap } from "@/lib/data/media";
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
  "foto-format": "Format foto tidak dikenali. Gunakan JPEG, PNG, atau WebP.",
  "foto-gagal": "Foto belum dapat diunggah. Coba lagi.",
  "foto-kosong": "Pilih file foto terlebih dahulu.",
  "foto-ukuran": "Ukuran foto terlalu besar setelah dikompres.",
  otorisasi: "Hanya admin yang dapat mengubah tanaman ini.",
  validasi: "Periksa kembali isian wajib, status, dan path gambar.",
};

const successMessages: Record<string, string> = {
  dibuat: "Tanaman berhasil dibuat.",
  diperbarui: "Perubahan tanaman berhasil disimpan.",
  "foto-diperbarui": "Foto tanaman berhasil diunggah.",
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

  const mediaByPlantId = await getPrimaryPlantMediaMap([result.data.id]);
  const currentMedia = mediaByPlantId.get(result.data.id) ?? null;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          <AdminStatusBadge
            contentStatus={result.data.content_status}
            validationStatus={result.data.validation_status}
          />
        }
        backHref="/admin/tanaman"
        backLabel="Kembali ke daftar tanaman"
        description={`${result.data.local_name}. Metadata pembuat, pengubah, pemeriksa, dan waktu publikasi ditetapkan oleh server.`}
        eyebrow="Admin Tanaman"
        title="Edit Tanaman"
      />
      <AdminNotice message={successMessages[query.success ?? ""]} />
      <AdminNotice message={errorMessages[query.error ?? ""]} tone="error" />
      <PhotoUploadForm
        action={uploadPlantPhotoAction}
        currentMedia={currentMedia}
        entityId={result.data.id}
        entityLabel={result.data.local_name}
      />
      <PlantAdminForm
        action={updatePlantAction.bind(null, result.data.id)}
        mode="edit"
        plant={result.data}
      />
    </div>
  );
}
