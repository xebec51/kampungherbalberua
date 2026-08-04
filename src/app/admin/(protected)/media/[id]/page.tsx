import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToneBadge as StatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminMediaAssetById } from "@/lib/data/admin/media";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Detail Media",
  description: "Detail metadata Media Library Kampung Herbal Berua.",
  path: "/admin/media/audit",
});

type AdminMediaDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminMediaDetailPage({
  params,
}: AdminMediaDetailPageProps) {
  const { id } = await params;
  const result = await getAdminMediaAssetById(id);

  if (!result.data) {
    notFound();
  }

  const media = result.data;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="green">{media.contentStatus}</StatusBadge>
            <StatusBadge tone="brown">{media.rightsStatus}</StatusBadge>
            <StatusBadge tone="neutral">{media.privacyStatus}</StatusBadge>
          </div>
        }
        backHref="/admin/media/audit"
        backLabel="Kembali ke Audit Media"
        eyebrow="Media Library"
        title={media.title}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-herbal-ink">Preview public</h3>
          {media.publicUrl ? (
            <figure className="relative mt-4 aspect-[4/3] overflow-hidden rounded-md border border-herbal-green/10 bg-herbal-soft">
              <Image
                alt={media.altText}
                className="object-cover"
                fill
                sizes="(min-width: 1280px) 44vw, 100vw"
                src={media.publicUrl}
              />
            </figure>
          ) : (
            <p className="mt-4 rounded-md bg-herbal-soft p-4 text-sm text-herbal-muted">
              Belum ada public path.
            </p>
          )}
          {media.originalSignedUrl ? (
            <a
              className="mt-4 inline-flex min-h-11 items-center rounded-md border border-herbal-green/30 px-4 py-2 text-sm font-bold text-herbal-green hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={media.originalSignedUrl}
              rel="noreferrer"
              target="_blank"
            >
              Buka original sementara
            </a>
          ) : null}
        </div>

        <div className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-herbal-ink">Metadata</h3>
          <dl className="mt-4 grid gap-4 text-sm">
            <MetadataRow label="Alt text" value={media.altText} />
            <MetadataRow label="Sumber" value={media.sourceType} />
            <MetadataRow label="Kreator" value={media.creatorName} />
            <MetadataRow label="Lisensi" value={media.licenseCode} />
            <MetadataRow label="Ukuran" value={`${media.width ?? "-"} x ${media.height ?? "-"}`} />
            <MetadataRow label="Checksum" value={media.checksumSha256} />
            <MetadataRow label="Perubahan" value={media.changesMade} />
            <MetadataRow label="Atribusi" value={media.attributionText} />
          </dl>
          <div className="mt-5 grid gap-2 text-sm">
            {media.sourcePageUrl ? (
              <a
                className="font-semibold text-herbal-green hover:underline"
                href={media.sourcePageUrl}
                rel="noreferrer"
                target="_blank"
              >
                Buka halaman sumber
              </a>
            ) : null}
            {media.licenseUrl ? (
              <a
                className="font-semibold text-herbal-green hover:underline"
                href={media.licenseUrl}
                rel="noreferrer"
                target="_blank"
              >
                Buka lisensi
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt className="font-bold text-herbal-ink">{label}</dt>
      <dd className="mt-1 break-words text-herbal-muted">
        {value?.trim() ? value : "Belum tersedia"}
      </dd>
    </div>
  );
}
