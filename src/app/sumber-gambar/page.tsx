import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getPublishedMediaAttributions } from "@/lib/data/media";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Sumber Gambar",
  description:
    "Daftar atribusi gambar dan dokumentasi visual yang digunakan pada website Kampung Herbal Berua.",
  path: "/sumber-gambar",
});

export default async function ImageAttributionPage() {
  const mediaItems = await getPublishedMediaAttributions();

  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Halaman ini memuat atribusi untuk gambar yang berasal dari dokumentasi KKN, sumber berlisensi, domain publik, atau aset lain yang sudah melewati pemeriksaan hak dan privasi."
          eyebrow="Atribusi Media"
          title="Sumber Gambar"
        />

        <div className="mt-8 grid gap-4">
          {mediaItems.map((media) => (
              <article
                className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm"
                key={media.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-herbal-ink">
                      {media.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-herbal-muted">
                      {media.attributionText ??
                        media.creatorName ??
                        "Atribusi tersedia pada metadata internal."}
                    </p>
                  </div>
                  <StatusBadge tone="green">
                    {media.imageType ?? "media"}
                  </StatusBadge>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <AttributionRow
                    label="Kreator"
                    value={media.creatorName ?? "Tidak tercantum"}
                  />
                  <AttributionRow
                    label="Lisensi"
                    value={media.licenseCode ?? "Dokumentasi lokal"}
                  />
                  <AttributionRow
                    label="Perubahan"
                    value={media.changesMade ?? "Tidak ada catatan perubahan"}
                  />
                  <AttributionRow
                    label="Caption"
                    value={media.caption ?? "Tidak ada caption"}
                  />
                </dl>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                  {media.sourcePageUrl ? (
                    <a
                      className="text-herbal-green hover:underline"
                      href={media.sourcePageUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Halaman sumber
                    </a>
                  ) : null}
                  {media.licenseUrl ? (
                    <a
                      className="text-herbal-green hover:underline"
                      href={media.licenseUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Lisensi
                    </a>
                  ) : null}
                </div>
              </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function AttributionRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold text-herbal-ink">{label}</dt>
      <dd className="mt-1 text-herbal-muted">{value}</dd>
    </div>
  );
}
