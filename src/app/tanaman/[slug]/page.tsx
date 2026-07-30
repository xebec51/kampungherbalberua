import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BrandCard } from "@/components/ui/BrandCard";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  getHerbaCodePlantBySlug,
  getHerbaCodePlantSlugs,
} from "@/lib/data/herbacode";
import {
  getPublishedPlantDetailBySlug,
  type PublishedPlantDetail,
} from "@/lib/data/plants";
import {
  getPosterPlantBySlug,
  getPosterPlantCatalog,
  getPosterPlantSlugs,
  normalizePosterName,
} from "@/lib/data/poster-plants";
import { createPageMetadata } from "@/lib/metadata";
import type {
  HerbaCodePlantProfile,
  HerbaCodePlantZoneEntry,
  PosterPlantCatalogItem,
  PublicMediaAsset,
} from "@/types";

type PlantDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const [herbaCodeSlugs, posterSlugs] = await Promise.all([
    getHerbaCodePlantSlugs(),
    getPosterPlantSlugs(),
  ]);
  const slugs = Array.from(new Set([...herbaCodeSlugs, ...posterSlugs]));

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PlantDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getHerbaCodePlantBySlug(slug);

  if (!plant) {
    const catalogPlant = await getPublishedPlantDetailBySlug(slug);

    if (catalogPlant) {
      return createPageMetadata({
        title: catalogPlant.localName,
        description: catalogPlant.shortDescription,
        path: `/tanaman/${catalogPlant.slug}`,
      });
    }

    const posterPlant = await getPosterPlantBySlug(slug);

    if (posterPlant) {
      return createPageMetadata({
        title: posterPlant.rawName,
        description: posterPlant.description,
        path: `/tanaman/${posterPlant.slug}`,
      });
    }

    return createPageMetadata({
      title: "Tanaman tidak ditemukan",
      description: "Data tanaman yang diminta belum tersedia.",
      path: "/tanaman",
    });
  }

  return createPageMetadata({
    title: plant.localName,
    description: `Profil HerbaCode ${plant.localName} dalam Kampung Herbal Harmony.`,
    path: `/tanaman/${plant.slug}`,
  });
}

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { slug } = await params;
  const plant = await getHerbaCodePlantBySlug(slug);

  if (!plant) {
    const catalogPlant = await getPublishedPlantDetailBySlug(slug);

    if (catalogPlant) {
      return <CatalogPlantDetail plant={catalogPlant} />;
    }

    const posterPlant = await getPosterPlantBySlug(slug);

    if (posterPlant) {
      return <PosterPlantDetail plant={posterPlant} />;
    }

    notFound();
  }

  const activeCompounds = uniqueEntryValues(
    plant.zoneEntries,
    (entry) => entry.activeCompounds,
  );
  const usedParts = uniqueEntryValues(plant.zoneEntries, (entry) => entry.usedParts);
  const cultivationTechniques = uniqueEntryValues(
    plant.zoneEntries,
    (entry) => entry.cultivationTechniques,
  );
  const warnings = uniqueEntryValues(plant.zoneEntries, (entry) => entry.warnings);
  const preparationMethods = uniqueEntryValues(
    plant.zoneEntries,
    (entry) => entry.preparationMethods,
  );
  const fallbackPosterVisual = plant.image
    ? null
    : await getPosterVisualForHerbaCodePlant(plant);
  const fallbackPosterImage = visibleDetailImageSrc(fallbackPosterVisual?.image);
  const fallbackLocalImage = visibleDetailImageSrc(localPlantDetailImages[plant.slug]);
  const visual = plant.image
      ? {
          alt: `Tanaman ${plant.localName}`,
          fallbackLabel: `Tanaman ${plant.localName}`,
          isIllustration: false,
          media: plant.imageMedia,
          src: plant.image,
        }
    : fallbackPosterVisual && fallbackPosterImage
      ? {
          alt: `Tanaman ${plant.localName}`,
          fallbackLabel: `Tanaman ${plant.localName}`,
          isIllustration: fallbackPosterVisual.imageIsIllustration,
          media: null,
          src: fallbackPosterImage,
        }
      : fallbackLocalImage
        ? {
            alt: `Tanaman ${plant.localName}`,
            fallbackLabel: `Tanaman ${plant.localName}`,
            isIllustration: false,
            media: null,
            src: fallbackLocalImage,
          }
        : {
            alt: `Tanaman ${plant.localName}`,
            fallbackLabel: `Tanaman ${plant.localName}`,
            isIllustration: false,
            media: null,
            src: null,
          };

  return (
    <article className="bg-herbal-cream py-10 sm:py-14">
      <Container>
        <Breadcrumb
          items={[
            { label: "Tanaman", href: "/tanaman" },
            { label: plant.localName },
          ]}
        />

        <div className="mt-8 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.78fr)] lg:items-start">
            <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="green">HerbaCode</StatusBadge>
              <StatusBadge tone="brown">
                {plant.zoneEntries.length} zona
              </StatusBadge>
            </div>
            <h1 className="mt-5 text-4xl font-bold text-herbal-ink sm:text-5xl">
              {plant.localName}
            </h1>
            {plant.scientificName ? (
              <p className="mt-2 text-lg italic text-herbal-muted">
                {plant.scientificName}
              </p>
            ) : null}
            {plant.aliases.length > 0 ? (
              <p className="mt-3 text-sm text-herbal-muted">
                Nama lain: {plant.aliases.join(", ")}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {plant.zoneEntries.map((entry) => (
                <Link
                  className="inline-flex min-h-10 items-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                  href={`/zona-kesehatan/${entry.zoneSlug}`}
                  key={entry.zoneCode}
                >
                  {entry.zoneTitle}
                </Link>
              ))}
            </div>
            </div>

            <PlantDetailImage priority visual={visual} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <DetailSection title="Senyawa aktif" values={activeCompounds} />
          <DetailSection title="Bagian yang digunakan" values={usedParts} />
          <DetailSection
            title="Teknik budidaya"
            values={cultivationTechniques}
          />
          <DetailSection title="Cara pemanfaatan" values={preparationMethods} />
          <DetailSection title="Perhatian" values={warnings} />
        </div>

        <BenefitsByZone entries={plant.zoneEntries} />

        <BrandCard as="section" className="mt-8 text-sm leading-6 text-herbal-muted">
          <h2 className="text-base font-bold text-herbal-ink">Sumber</h2>
          <p className="mt-3">{plant.sourceDocumentName}</p>
        </BrandCard>

        <div className="mt-8">
          <Disclaimer>
            Informasi tanaman dan ramuan pada website ini disediakan untuk
            edukasi mengenai pemanfaatan tradisional. Informasi ini bukan
            diagnosis, resep, atau pengganti konsultasi dengan dokter, apoteker,
            maupun tenaga kesehatan lainnya.
          </Disclaimer>
        </div>
      </Container>
    </article>
  );
}

function CatalogPlantDetail({ plant }: { plant: PublishedPlantDetail }) {
  const sourceNotes = plant.sourceNotes?.trim();
  const hasSeparateDescription =
    plant.description.trim() !== plant.shortDescription.trim();
  const visual = plant.image
    ? {
        alt: `Tanaman ${plant.localName}`,
        fallbackLabel: `Tanaman ${plant.localName}`,
        isIllustration: false,
        media: null,
        src: plant.image,
      }
    : {
        alt: `Tanaman ${plant.localName}`,
        fallbackLabel: `Tanaman ${plant.localName}`,
        isIllustration: false,
        media: null,
        src: null,
      };

  return (
    <article className="bg-herbal-cream py-10 sm:py-14">
      <Container>
        <Breadcrumb
          items={[
            { label: "Tanaman", href: "/tanaman" },
            { label: plant.localName },
          ]}
        />

        <div className="mt-8 grid gap-8 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.78fr)] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="green">Katalog tanaman</StatusBadge>
            </div>
            <h1 className="mt-5 text-4xl font-bold text-herbal-ink sm:text-5xl">
              {plant.localName}
            </h1>
            {plant.scientificName ? (
              <p className="mt-2 text-lg italic text-herbal-muted">
                {plant.scientificName}
              </p>
            ) : null}
            <p className="mt-6 max-w-3xl text-base leading-8 text-herbal-muted">
              {plant.shortDescription}
            </p>
          </div>

          <PlantDetailImage priority visual={visual} />
        </div>

        {hasSeparateDescription ? (
          <BrandCard as="section" className="mt-8 text-sm leading-6 text-herbal-muted">
            <h2 className="text-base font-bold text-herbal-ink">Deskripsi</h2>
            <p className="mt-3">{plant.description}</p>
          </BrandCard>
        ) : null}

        {sourceNotes ? (
          <BrandCard as="section" className="mt-8 text-sm leading-6 text-herbal-muted">
            <h2 className="text-base font-bold text-herbal-ink">Sumber</h2>
            <p className="mt-3">{sourceNotes}</p>
          </BrandCard>
        ) : null}

        <div className="mt-8">
          <Disclaimer>
            Informasi tanaman dan ramuan pada website ini disediakan untuk
            edukasi mengenai pemanfaatan tradisional. Informasi ini bukan
            diagnosis, resep, atau pengganti konsultasi dengan dokter, apoteker,
            maupun tenaga kesehatan lainnya.
          </Disclaimer>
        </div>
      </Container>
    </article>
  );
}

function PosterPlantDetail({ plant }: { plant: PosterPlantCatalogItem }) {
  const image = visibleDetailImageSrc(plant.image);
  const visual = image
    ? {
        alt: plant.imageIsIllustration
          ? `Visual referensi untuk tanaman ${plant.rawName}`
          : `Tanaman ${plant.rawName}`,
        fallbackLabel: `Tanaman ${plant.rawName}`,
        isIllustration: plant.imageIsIllustration,
        media: null,
        src: image,
      }
    : {
        alt: `Tanaman ${plant.rawName}`,
        fallbackLabel: `Tanaman ${plant.rawName}`,
        isIllustration: false,
        media: null,
        src: null,
      };
  const sourceDetails = [
    plant.sourceLabel,
    plant.attributionText,
    plant.licenseCode,
  ].filter((value): value is string => Boolean(value?.trim()));

  return (
    <article className="bg-herbal-cream py-10 sm:py-14">
      <Container>
        <Breadcrumb
          items={[
            { label: "Tanaman", href: "/tanaman" },
            { label: plant.rawName },
          ]}
        />

        <div className="mt-8 grid gap-8 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.78fr)] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="green">Katalog Harmony</StatusBadge>
              {plant.posterOccurrenceCount > 0 ? (
                <StatusBadge tone="brown">
                  {plant.posterOccurrenceCount} kemunculan poster
                </StatusBadge>
              ) : null}
            </div>
            <h1 className="mt-5 text-4xl font-bold text-herbal-ink sm:text-5xl">
              {plant.rawName}
            </h1>
            {plant.scientificName ? (
              <p className="mt-2 text-lg italic text-herbal-muted">
                {plant.scientificName}
              </p>
            ) : null}
            <p className="mt-6 max-w-3xl text-base leading-8 text-herbal-muted">
              {plant.description}
            </p>
          </div>

          <PlantDetailImage priority visual={visual} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <DetailSection title="Zona katalog" values={plant.collections} />
          <DetailSection
            title="Nomor poster"
            values={plant.posterNumbers.map((number) => String(number))}
          />
          <DetailSection title="Sumber" values={sourceDetails} />
        </div>

        <div className="mt-8">
          <Disclaimer>
            Entri katalog poster ini tidak menambahkan manfaat atau cara
            pemanfaatan di luar dokumen HerbaCode. Informasi kesehatan tetap
            perlu diverifikasi oleh tenaga kesehatan.
          </Disclaimer>
        </div>
      </Container>
    </article>
  );
}

type PlantDetailVisual = {
  alt: string;
  fallbackLabel: string;
  isIllustration: boolean;
  media: PublicMediaAsset | null;
  src: string | null;
};

const localPlantDetailImages: Record<string, string> = {
  jahe: "/images/plants/jahe.webp",
};

function visibleDetailImageSrc(value: string | null | undefined) {
  if (!value || value.startsWith("/images/placeholders/")) {
    return null;
  }

  return value;
}

async function getPosterVisualForHerbaCodePlant(plant: HerbaCodePlantProfile) {
  const normalizedCandidates = new Set(
    [plant.localName, ...plant.aliases].map(normalizePosterName).filter(Boolean),
  );
  const catalog = await getPosterPlantCatalog();

  return (
    catalog.find((item) => {
      if (!visibleDetailImageSrc(item.image)) {
        return false;
      }

      return (
        item.linkedPlantSlug === plant.slug ||
        normalizedCandidates.has(item.normalizedName)
      );
    }) ?? null
  );
}

function PlantDetailImage({
  priority = false,
  visual,
}: {
  priority?: boolean;
  visual: PlantDetailVisual;
}) {
  return (
    <ImageFrame className="lg:sticky lg:top-24">
      <SafeImage
          alt={visual.alt}
          className="aspect-[4/3] w-full !rounded-md !border-0 !shadow-none lg:aspect-[5/4]"
          fallbackLabel={visual.fallbackLabel}
          fallbackVariant="plant"
          imageClassName="object-cover"
          illustrationLabel="Visual referensi"
          labelIllustration={visual.isIllustration}
          media={visual.media}
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 38vw"
          showAttribution
          src={visual.src}
        />
    </ImageFrame>
  );
}

function uniqueEntryValues(
  entries: HerbaCodePlantZoneEntry[],
  selector: (entry: HerbaCodePlantZoneEntry) => string[],
) {
  return Array.from(new Set(entries.flatMap(selector).filter(Boolean)));
}

function BenefitsByZone({ entries }: { entries: HerbaCodePlantZoneEntry[] }) {
  const entriesWithBenefits = entries.filter((entry) => entry.benefits.length > 0);

  if (entriesWithBenefits.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-herbal-ink">Manfaat per zona</h2>
      <div className="mt-4 grid gap-5">
        {entriesWithBenefits.map((entry) => (
          <section
            className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)]"
            key={entry.id}
          >
            <h3 className="text-base font-bold text-herbal-ink">
              {entry.zoneTitle}
            </h3>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-herbal-muted">
              {entry.benefits.map((benefit) => (
                <li className="flex gap-2" key={benefit}>
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 rounded-full bg-herbal-green"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

function DetailSection({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  if (values.length === 0) {
    return null;
  }

  return (
    <BrandCard as="section">
      <h2 className="text-base font-bold text-herbal-ink">{title}</h2>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-herbal-muted">
        {values.map((value) => (
          <li className="flex gap-2" key={value}>
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 rounded-full bg-herbal-green"
            />
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </BrandCard>
  );
}
