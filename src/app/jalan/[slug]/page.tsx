import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BrandCard } from "@/components/ui/BrandCard";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  getPublishedStreetBySlug,
  getPublishedStreetSlugs,
} from "@/lib/data/streets";
import { createPageMetadata } from "@/lib/metadata";

type StreetDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPublishedStreetSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: StreetDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const street = await getPublishedStreetBySlug(slug);

  if (!street) {
    return createPageMetadata({
      title: "Jalan tidak ditemukan",
      description: "Data jalan tematik yang diminta tidak tersedia.",
      path: "/jalan",
    });
  }

  return createPageMetadata({
    title: street.streetName,
    description:
      street.description ??
      `Dokumentasi jalan tematik ${street.streetName} di Kampung Herbal Harmony.`,
    path: `/jalan/${street.slug}`,
  });
}

export default async function StreetDetailPage({
  params,
}: StreetDetailPageProps) {
  const { slug } = await params;
  const street = await getPublishedStreetBySlug(slug);

  if (!street) {
    notFound();
  }

  return (
    <article className="bg-herbal-cream py-10 sm:py-14">
      <Container>
        <Breadcrumb
          items={[{ label: "Jalan Tematik", href: "/jalan" }, { label: street.streetName }]}
        />

        <div className="mt-8 grid gap-8 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="brown">Jalan tematik</StatusBadge>
              <StatusBadge tone="green">
                {street.plantCount} entri tanaman
              </StatusBadge>
            </div>
            <h1 className="mt-5 text-4xl font-bold text-herbal-ink sm:text-5xl">
              {street.streetName}
            </h1>
            {street.description ? (
              <p className="mt-5 max-w-2xl text-base leading-8 text-herbal-muted">
                {street.description}
              </p>
            ) : null}
            {street.blockRanges.length > 0 ? (
              <dl className="mt-6 rounded-md border border-herbal-green/10 bg-herbal-cream/55 p-5">
                <dt className="text-sm font-bold text-herbal-ink">
                  Blok pada papan
                </dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {street.blockRanges.map((blockRange) => (
                    <span
                      className="rounded-md border border-herbal-green/20 bg-herbal-soft px-3 py-1 text-sm font-bold text-herbal-deep"
                      key={blockRange}
                    >
                      {blockRange}
                    </span>
                  ))}
                </dd>
              </dl>
            ) : null}
          </div>

          {street.imagePath ? (
            <figure className="overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image
                  alt={street.imageAlt}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  src={street.imagePath}
                />
              </div>
              <figcaption className="border-t border-herbal-green/10 px-4 py-3 text-xs leading-5 text-herbal-muted">
                {street.attributionText}
              </figcaption>
            </figure>
          ) : null}
        </div>

        {street.plantEntries.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-herbal-ink">
              Tanaman pada jalan ini
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-herbal-muted">
              Daftar ini mengikuti tema papan jalan dan koleksi tanaman pada
              katalog Kampung Herbal. Data ini tidak diambil dari relasi
              tanaman-zona HerbaCode.
            </p>
            <div className="mt-4 grid gap-3">
              {street.plantEntries.map((entry) => (
                <StreetPlantEntryCard entry={entry} key={entry.id} />
              ))}
            </div>
          </section>
        ) : (
          <BrandCard as="section" className="mt-8 text-sm leading-7 text-herbal-muted">
            <h2 className="text-base font-bold text-herbal-ink">
              Catatan sumber foto
            </h2>
            <p className="mt-3">
              Foto papan {street.streetName} belum terhubung dengan daftar
              tanaman yang dapat diverifikasi.
            </p>
          </BrandCard>
        )}

        {street.relatedZones.length > 0 ? (
          <BrandCard as="section" className="mt-8">
            <h2 className="text-base font-bold text-herbal-ink">
              Zona terkait
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {street.relatedZones.map((zone) => (
                <Link
                  className="inline-flex min-h-10 items-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                  href={`/zona-kesehatan/${zone.slug}`}
                  key={zone.slug}
                >
                  {zone.title}
                </Link>
              ))}
            </div>
          </BrandCard>
        ) : null}
      </Container>
    </article>
  );
}

function StreetPlantEntryCard({
  entry,
}: {
  entry: NonNullable<Awaited<ReturnType<typeof getPublishedStreetBySlug>>>["plantEntries"][number];
}) {
  const content = (
    <>
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-herbal-brown">
        Urutan {entry.sortOrder}
      </span>
      <span className="mt-1 block text-lg font-bold text-herbal-ink">
        {entry.rawPlantName}
      </span>
      {entry.scientificName ? (
        <span className="mt-1 block text-sm italic text-herbal-muted">
          {entry.scientificName}
        </span>
      ) : null}
    </>
  );

  if (!entry.plantSlug) {
    return (
      <BrandCard className="p-4">
        {content}
      </BrandCard>
    );
  }

  return (
    <Link
      className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] transition hover:border-herbal-green/35 hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
      href={`/tanaman/${entry.plantSlug}`}
    >
      {content}
    </Link>
  );
}
