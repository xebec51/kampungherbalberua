import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BrandCard } from "@/components/ui/BrandCard";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ZonePlantMiniCard } from "@/components/zones/ZonePlantMiniCard";
import {
  getHerbaCodePlantCatalog,
  getHerbaCodeZoneBySlug,
  getHerbaCodeZoneSummaries,
} from "@/lib/data/herbacode";
import { getPublishedHealthZoneDetailBySlug } from "@/lib/data/health-zones";
import { createPageMetadata } from "@/lib/metadata";
import type { HealthZone, HerbaCodePlantZoneEntry } from "@/types";

type HealthZoneDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const zones = await getHerbaCodeZoneSummaries();

  return zones.map((zone) => ({ slug: zone.slug }));
}

export async function generateMetadata({
  params,
}: HealthZoneDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const zone = await getHerbaCodeZoneBySlug(slug);

  if (!zone) {
    const catalogZone = await getPublishedHealthZoneDetailBySlug(slug);

    if (catalogZone) {
      return createPageMetadata({
        title: catalogZone.streetName ?? catalogZone.zoneName,
        description: catalogZone.shortDescription,
        path: `/zona-kesehatan/${catalogZone.slug}`,
      });
    }

    return createPageMetadata({
      title: "Zona tidak ditemukan",
      description: "Data zona kesehatan yang diminta tidak tersedia.",
      path: "/zona-kesehatan",
    });
  }

  return createPageMetadata({
    title: zone.title,
    description: zone.shortDescription,
    path: `/zona-kesehatan/${zone.slug}`,
  });
}

export default async function HealthZoneDetailPage({
  params,
}: HealthZoneDetailPageProps) {
  const { slug } = await params;
  const zone = await getHerbaCodeZoneBySlug(slug);

  if (!zone) {
    const catalogZone = await getPublishedHealthZoneDetailBySlug(slug);

    if (!catalogZone) {
      notFound();
    }

    return <CatalogZoneDetail zone={catalogZone} />;
  }

  const plantCatalog = await getHerbaCodePlantCatalog();
  const plantBySlug = new Map(plantCatalog.map((plant) => [plant.slug, plant]));
  const uniqueEntries = dedupeZonePlantEntries(zone.entries);

  return (
    <article className="bg-herbal-cream py-10 sm:py-14">
      <Container>
        <Breadcrumb
          items={[
            { label: "Zona Kesehatan", href: "/zona-kesehatan" },
            { label: zone.title },
          ]}
        />

        <div className="mt-8 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="green">Zona HerbaCode</StatusBadge>
              <StatusBadge tone="brown">{zone.entries.length} tanaman</StatusBadge>
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
              Kampung Herbal Harmony
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-herbal-ink sm:text-5xl">
              {zone.title}
            </h1>
            {zone.streetNames.length > 0 ? (
              <p className="mt-3 text-lg font-semibold text-herbal-green">
                {zone.streetNames.join(", ")}
              </p>
            ) : null}
            <p className="mt-6 max-w-3xl text-base leading-8 text-herbal-muted">
              {zone.shortDescription}
            </p>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-herbal-ink">
            Tanaman pada zona ini
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-herbal-muted">
            Informasi tanaman dan pemanfaatan tradisional pada bagian ini
            bersumber dari HerbaCode.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uniqueEntries.map((entry, index) => (
              <ZonePlantMiniCard
                entry={entry}
                key={entry.plantSlug}
                plant={plantBySlug.get(entry.plantSlug)}
                priority={index < 3}
              />
            ))}
          </div>
        </section>

        <BrandCard as="section" className="mt-8 text-sm leading-6 text-herbal-muted">
          <h2 className="text-base font-bold text-herbal-ink">Sumber</h2>
          <p className="mt-3">HerbaCode Kampung Herbal Harmony</p>
        </BrandCard>

        <div className="mt-8">
          <Disclaimer>
            Materi pada halaman ini disediakan sebagai edukasi umum mengenai
            pemanfaatan tradisional. Informasi ini bukan diagnosis, resep, atau
            pengganti konsultasi dengan dokter, apoteker, maupun tenaga
            kesehatan lainnya. Informasi tanaman herbal harus diverifikasi
            sebelum digunakan.
          </Disclaimer>
        </div>
      </Container>
    </article>
  );
}

function visibleZoneImagePath(value: string | null | undefined) {
  if (!value || value.startsWith("/images/placeholders/")) {
    return null;
  }

  return value;
}

function dedupeZonePlantEntries(entries: HerbaCodePlantZoneEntry[]) {
  const seen = new Set<string>();
  const uniqueEntries: HerbaCodePlantZoneEntry[] = [];

  for (const entry of entries) {
    if (seen.has(entry.plantSlug)) {
      continue;
    }

    seen.add(entry.plantSlug);
    uniqueEntries.push(entry);
  }

  return uniqueEntries;
}

function CatalogZoneDetail({ zone }: { zone: HealthZone }) {
  const image = visibleZoneImagePath(zone.imagePath);
  const title = zone.streetName ?? zone.zoneName;

  return (
    <article className="bg-herbal-cream py-10 sm:py-14">
      <Container>
        <Breadcrumb
          items={[
            { label: "Zona Kesehatan", href: "/zona-kesehatan" },
            { label: title },
          ]}
        />

        <div
          className={
            image ? "mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]" : "mt-8"
          }
        >
          {image ? (
            <SafeImage
              alt={zone.zoneName}
              fallbackLabel={zone.zoneName}
              fallbackVariant="map"
              imageClassName="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              src={image}
            />
          ) : null}

          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="brown">Katalog zona</StatusBadge>
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
              {zone.programName}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-herbal-ink sm:text-5xl">
              {title}
            </h1>
            {zone.streetName ? (
              <p className="mt-3 text-lg font-semibold text-herbal-green">
                {zone.zoneName}
              </p>
            ) : null}
            <p className="mt-6 max-w-3xl text-base leading-8 text-herbal-muted">
              {zone.shortDescription}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <TextSection title="Fokus materi" value={zone.healthTopic} />
          <TextSection title="Gambaran umum" value={zone.overview} />
          <ListSection title="Blok" values={zone.blockRanges} />
          <ListSection title="Poin edukasi" values={zone.educationalPoints} />
          <ListSection title="Kebiasaan sehat" values={zone.healthyHabits} />
          <ListSection title="Catatan penting" values={zone.importantNotes} />
          <ListSection title="Sumber" values={zone.sourceNotes} />
        </div>

        <div className="mt-8">
          <Disclaimer>
            Materi pada halaman ini disediakan sebagai edukasi umum mengenai
            pemanfaatan tradisional. Informasi ini bukan diagnosis, resep, atau
            pengganti konsultasi dengan dokter, apoteker, maupun tenaga
            kesehatan lainnya. Informasi tanaman herbal harus diverifikasi
            sebelum digunakan.
          </Disclaimer>
        </div>
      </Container>
    </article>
  );
}

function TextSection({ title, value }: { title: string; value: string | null }) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <BrandCard as="section">
      <h2 className="text-base font-bold text-herbal-ink">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-herbal-muted">{value}</p>
    </BrandCard>
  );
}

function ListSection({ title, values }: { title: string; values: string[] }) {
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
