import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  getHerbaCodeZoneBySlug,
  getHerbaCodeZoneSummaries,
} from "@/lib/data/herbacode";
import { getPublishedHealthZoneDetailBySlug } from "@/lib/data/health-zones";
import { absoluteUrl, createPageMetadata } from "@/lib/metadata";
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
        title: catalogZone.streetName,
        description: catalogZone.shortDescription,
        path: `/zona-kesehatan/${catalogZone.slug}`,
      });
    }

    return createPageMetadata({
      title: "Zona tidak ditemukan",
      description: "Data zona kesehatan yang diminta belum tersedia.",
      path: "/zona-kesehatan",
    });
  }

  return createPageMetadata({
    title: zone.title,
    description: `Data HerbaCode untuk ${zone.title}.`,
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

  const qrTarget = absoluteUrl(`/z/${zone.zoneCode}`);

  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[
            { label: "Zona Kesehatan", href: "/zona-kesehatan" },
            { label: zone.title },
          ]}
        />

        <div className="mt-8">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="green">{zone.zoneCode}</StatusBadge>
            <StatusBadge tone="brown">{zone.entries.length} tanaman</StatusBadge>
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
            Kampung Herbal Harmony
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-herbal-ink sm:text-5xl">
            {zone.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-herbal-muted">
            Data pada halaman ini bersumber dari HerbaCode Kampung Herbal
            Harmony dan disusun sebagai relasi tanaman-zona.
          </p>
        </div>

        <section className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm">
          <h2 className="text-base font-bold text-herbal-ink">
            Informasi QR permanen
          </h2>
          <p className="mt-3">
            Kode QR zona memakai kode permanen {zone.zoneCode}. Target:
            {" "}
            {qrTarget}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-herbal-ink">
            Tanaman pada zona ini
          </h2>
          <div className="mt-5 grid gap-5">
            {zone.entries.map((entry) => (
              <ZonePlantPanel entry={entry} key={entry.id} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm">
          <h2 className="text-base font-bold text-herbal-ink">Sumber</h2>
          <p className="mt-3">HerbaCode Kampung Herbal Harmony</p>
        </section>

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

function CatalogZoneDetail({ zone }: { zone: HealthZone }) {
  const qrTarget = absoluteUrl(`/z/${zone.zoneCode}`);
  const image = visibleZoneImagePath(zone.imagePath);

  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[
            { label: "Zona Kesehatan", href: "/zona-kesehatan" },
            { label: zone.streetName },
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
              <StatusBadge tone="green">{zone.zoneCode}</StatusBadge>
              <StatusBadge tone="brown">Katalog zona</StatusBadge>
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
              {zone.programName}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-herbal-ink sm:text-5xl">
              {zone.streetName}
            </h1>
            <p className="mt-3 text-lg font-semibold text-herbal-green">
              {zone.zoneName}
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-herbal-muted">
              {zone.shortDescription}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm">
          <h2 className="text-base font-bold text-herbal-ink">
            Informasi QR permanen
          </h2>
          <p className="mt-3">
            Kode QR zona memakai kode permanen {zone.zoneCode}. Target:{" "}
            {qrTarget}
          </p>
        </section>

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

function ZonePlantPanel({ entry }: { entry: HerbaCodePlantZoneEntry }) {
  return (
    <article className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-herbal-ink">
            <Link
              className="transition hover:text-herbal-green"
              href={`/tanaman/${entry.plantSlug}`}
            >
              {entry.plantLocalName}
            </Link>
          </h3>
          {entry.plantScientificName ? (
            <p className="mt-1 text-sm italic text-herbal-muted">
              {entry.plantScientificName}
            </p>
          ) : null}
        </div>
        <StatusBadge tone="green">No. {entry.entryOrder}</StatusBadge>
      </div>

      <EntrySection title="Senyawa aktif" values={entry.activeCompounds} />
      <EntrySection title="Manfaat" values={entry.benefits} />
      <EntrySection title="Bagian yang digunakan" values={entry.usedParts} />
      <EntrySection
        title="Teknik budidaya"
        values={entry.cultivationTechniques}
      />
      <EntrySection title="Cara pemanfaatan" values={entry.preparationMethods} />
      <EntrySection title="Perhatian" values={entry.warnings} />
    </article>
  );
}

function TextSection({ title, value }: { title: string; value: string | null }) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-herbal-ink">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-herbal-muted">{value}</p>
    </section>
  );
}

function ListSection({ title, values }: { title: string; values: string[] }) {
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

function EntrySection({
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
    <section className="mt-5 border-t border-herbal-green/10 pt-4">
      <h4 className="text-sm font-bold text-herbal-ink">{title}</h4>
      <ul className="mt-2 grid gap-2 text-sm leading-6 text-herbal-muted">
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
