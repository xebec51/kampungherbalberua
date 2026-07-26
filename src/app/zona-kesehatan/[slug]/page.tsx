import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { healthZones as localHealthZones } from "@/data/health-zones";
import {
  getHealthZoneBySlug,
  getPublishedHealthZones,
} from "@/lib/data/health-zones";
import { getValidationStatusLabel } from "@/lib/formatters";
import { absoluteUrl, createPageMetadata } from "@/lib/metadata";

type HealthZoneDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return localHealthZones
    .filter((zone) => zone.contentStatus === "published")
    .map((zone) => ({ slug: zone.slug }));
}

export async function generateMetadata({
  params,
}: HealthZoneDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const zone = await getHealthZoneBySlug(slug);

  if (!zone) {
    return createPageMetadata({
      title: "Zona tidak ditemukan",
      description: "Data zona kesehatan yang diminta belum tersedia.",
      path: "/zona-kesehatan",
    });
  }

  return createPageMetadata({
    title: `${zone.streetName} - ${zone.zoneName}`,
    description: zone.shortDescription,
    path: `/zona-kesehatan/${zone.slug}`,
  });
}

export default async function HealthZoneDetailPage({
  params,
}: HealthZoneDetailPageProps) {
  const { slug } = await params;
  const zone = await getHealthZoneBySlug(slug);

  if (!zone) {
    notFound();
  }

  const zones = await getPublishedHealthZones();
  const relatedZones = zones
    .filter((item) => item.zoneCode !== zone.zoneCode)
    .slice(0, 3);
  const qrTarget = absoluteUrl(`/z/${zone.zoneCode}`);
  const needsExtraCare = zone.slug === "pediatria" || zone.slug === "feminia";

  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[
            { label: "Zona Kesehatan", href: "/zona-kesehatan" },
            { label: zone.streetName },
          ]}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <ImagePlaceholder
              label={`Placeholder foto papan ${zone.streetName}`}
              variant="map"
            />
            <div className="mt-5 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-herbal-ink">
                Informasi QR permanen
              </h2>
              <p className="mt-2 text-sm leading-6 text-herbal-muted">
                Kode QR zona memakai kode permanen {zone.zoneCode}, bukan slug
                halaman. Target: {qrTarget}
              </p>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="green">{zone.zoneCode}</StatusBadge>
              <StatusBadge tone="brown">
                {getValidationStatusLabel(zone.validationStatus)}
              </StatusBadge>
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
              {zone.programName}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-herbal-ink sm:text-5xl">
              {zone.streetName}
            </h1>
            <p className="mt-3 text-xl font-semibold text-herbal-green">
              {zone.zoneName}
            </p>
            <p className="mt-3 text-sm text-herbal-muted">
              Blok {zone.blockRanges.join(", ")}
            </p>
            <p className="mt-6 text-base leading-8 text-herbal-muted">
              {zone.shortDescription}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <InfoPanel title="Fokus materi" values={[zone.healthTopic]} />
          <InfoPanel title="Gambaran umum" values={[zone.overview]} />
          <InfoPanel title="Poin edukasi" values={zone.educationalPoints} />
          <InfoPanel title="Kebiasaan sehat" values={zone.healthyHabits} />
          <InfoPanel title="Catatan penting" values={zone.importantNotes} />
          <InfoPanel
            title="Sumber dan validasi"
            values={[
              `Validator: ${zone.validatorName}`,
              ...(zone.sourceNotes.length > 0
                ? zone.sourceNotes
                : ["Sumber rujukan tertulis belum dicantumkan."]),
            ]}
          />
        </div>

        <div className="mt-8">
          <Disclaimer>
            Materi pada halaman ini disediakan sebagai edukasi umum mengenai
            tema kesehatan pada Zona Kampung Herbal Harmony. Informasi ini bukan
            diagnosis, resep, atau pengganti konsultasi dengan dokter, apoteker,
            maupun tenaga kesehatan lainnya. Informasi tanaman herbal harus
            diverifikasi sebelum digunakan.
            {needsExtraCare ? (
              <span className="mt-2 block">
                Anak, ibu hamil, ibu menyusui, dan pengguna obat rutin harus
                berkonsultasi dengan tenaga kesehatan sebelum menggunakan ramuan
                herbal.
              </span>
            ) : null}
          </Disclaimer>
        </div>

        <section className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-herbal-ink">Zona lainnya</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedZones.map((item) => (
              <Link
                className="inline-flex min-h-10 items-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                href={`/zona-kesehatan/${item.slug}`}
                key={item.zoneCode}
              >
                {item.streetName}
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </article>
  );
}

type InfoPanelProps = {
  title: string;
  values: string[];
};

function InfoPanel({ title, values }: InfoPanelProps) {
  return (
    <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-herbal-ink">{title}</h2>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-herbal-muted">
        {values.map((value) => (
          <li className="flex gap-2" key={value}>
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-herbal-green" />
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
