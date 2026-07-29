import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
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
import { createPageMetadata } from "@/lib/metadata";
import type { HerbaCodePlantZoneEntry } from "@/types";

type PlantDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getHerbaCodePlantSlugs();

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

    if (!catalogPlant) {
      notFound();
    }

    return <CatalogPlantDetail plant={catalogPlant} />;
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

  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[
            { label: "Tanaman", href: "/tanaman" },
            { label: plant.localName },
          ]}
        />

        <div
          className={
            plant.image
              ? "mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
              : "mt-8"
          }
        >
          {plant.image ? (
            <SafeImage
              alt={`Tanaman ${plant.localName}`}
              fallbackLabel={`Tanaman ${plant.localName}`}
              fallbackVariant="plant"
              imageClassName="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              src={plant.image}
            />
          ) : null}

          <div>
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

        <section className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm">
          <h2 className="text-base font-bold text-herbal-ink">Sumber</h2>
          <p className="mt-3">{plant.sourceDocumentName}</p>
        </section>

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

  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[
            { label: "Tanaman", href: "/tanaman" },
            { label: plant.localName },
          ]}
        />

        <div
          className={
            plant.image
              ? "mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
              : "mt-8"
          }
        >
          {plant.image ? (
            <SafeImage
              alt={`Tanaman ${plant.localName}`}
              fallbackLabel={`Tanaman ${plant.localName}`}
              fallbackVariant="plant"
              imageClassName="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              src={plant.image}
            />
          ) : null}

          <div>
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
        </div>

        {hasSeparateDescription ? (
          <section className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm">
            <h2 className="text-base font-bold text-herbal-ink">Deskripsi</h2>
            <p className="mt-3">{plant.description}</p>
          </section>
        ) : null}

        {sourceNotes ? (
          <section className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm">
            <h2 className="text-base font-bold text-herbal-ink">Sumber</h2>
            <p className="mt-3">{sourceNotes}</p>
          </section>
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
            className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm"
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
    <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
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
    </section>
  );
}
