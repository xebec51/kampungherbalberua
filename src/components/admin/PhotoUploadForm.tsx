"use client";

import { useFormStatus } from "react-dom";
import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { SafeImage } from "@/components/ui/SafeImage";
import type { PublicMediaAsset } from "@/types";

type PhotoUploadFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  currentMedia: PublicMediaAsset | null;
  entityId: string;
  entityLabel: string;
};

// Uploads through uploadContentCoverPhoto (media_assets + plant_media /
// health_zone_media), not the legacy plants/health_zones.image_path text
// field -- see src/lib/data/admin/media-upload.ts for why.
export function PhotoUploadForm({
  action,
  currentMedia,
  entityId,
  entityLabel,
}: PhotoUploadFormProps) {
  return (
    <AdminFormSection
      description="Format JPEG, PNG, atau WebP. Otomatis dikompres dan diubah ke WebP. Foto baru menggantikan foto sampul sebelumnya (foto lama tidak dihapus dari pustaka media)."
      title="Foto sampul"
    >
      <div className="grid gap-4 sm:grid-cols-[11rem_1fr] sm:items-start">
        <SafeImage
          alt={`Foto ${entityLabel}`}
          className="aspect-[4/3] w-full"
          fallbackLabel={`Foto ${entityLabel}`}
          fallbackVariant="plant"
          media={currentMedia}
        />
        <form action={action} className="grid gap-3">
          <input name="id" type="hidden" value={entityId} />
          <label
            className="grid gap-2 text-sm font-semibold text-herbal-ink"
            htmlFor={`photo-${entityId}`}
          >
            Unggah foto baru
            <input
              accept="image/jpeg,image/png,image/webp"
              className="text-sm text-herbal-ink file:mr-3 file:rounded-md file:border-0 file:bg-herbal-green file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-herbal-deep"
              id={`photo-${entityId}`}
              name="photo"
              required
              type="file"
            />
          </label>
          <UploadButton />
        </form>
      </div>
    </AdminFormSection>
  );
}

function UploadButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-10 w-fit items-center justify-center rounded-md bg-herbal-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Mengunggah..." : "Unggah Foto"}
    </button>
  );
}
