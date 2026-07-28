import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { plants as localPlants } from "@/data/plants";
import { getPlantBySlug } from "@/lib/data/plants";
import { getPosterPlantBySlug } from "@/lib/data/poster-plants";
import { getValidationStatusLabel } from "@/lib/formatters";
import { createPageMetadata } from "@/lib/metadata";
import type { PosterPlantCatalogItem } from "@/types";

type PlantDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

// Database plants can be published without a full site rebuild, so new
// slugs must still render on demand instead of 404ing.
export const dynamicParams = true;

// Pre-render the known local/demo slugs at build time for fast first loads;
// any other slug (e.g. one only published later in Supabase) still renders
// on demand thanks to dynamicParams above.
export function generateStaticParams() {
  return localPlants
    .filter((plant) => plant.published)
    .map((plant) => ({ slug: plant.slug }));
}

export async function generateMetadata({
  params,
}: PlantDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const posterPlant = await getPosterPlantBySlug(slug);
  const plant = posterPlant?.linkedPlantSlug
    ? await getPlantBySlug(posterPlant.linkedPlantSlug)
    : await getPlantBySlug(slug);

  if (!posterPlant && !plant) {
    return createPageMetadata({
      title: "Tanaman tidak ditemukan",
      description: "Data tanaman yang diminta belum tersedia.",
      path: "/tanaman",
    });
  }

  return createPageMetadata({
    title: posterPlant?.rawName ?? plant?.localName ?? "Tanaman",
    description:
      posterPlant?.description ??
      plant?.shortDescription ??
      "Katalog tanaman Kampung Herbal Harmony.",
    path: `/tanaman/${posterPlant?.slug ?? plant?.slug}`,
  });
}

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { slug } = await params;
  const posterPlant = await getPosterPlantBySlug(slug);
  const plant = posterPlant?.linkedPlantSlug
    ? await getPlantBySlug(posterPlant.linkedPlantSlug)
    : await getPlantBySlug(slug);

  // Renders the not-found UI for unknown slugs. Note: with dynamicParams
  // enabled, this Next.js version serves the not-found boundary with a 200
  // status for slugs outside generateStaticParams instead of 404 — a known
  // framework limitation, not something fixable from application code.
  if (!posterPlant && !plant) {
    notFound();
  }

  if (!plant && posterPlant) {
    return <PosterOnlyPlantDetail plant={posterPlant} />;
  }

  if (!plant) {
    notFound();
  }

  const image = posterPlant?.image ?? plant.image;

  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[
            { label: "Tanaman", href: "/tanaman" },
            { label: plant.localName },
          ]}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SafeImage
              alt={`Tanaman ${plant.localName}`}
              fallbackLabel={`Ilustrasi placeholder tanaman ${plant.localName}`}
              fallbackVariant="plant"
              imageClassName="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
              src={image}
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-herbal-ink">
                  Lokasi tanaman
                </h2>
                <p className="mt-2 text-sm leading-6 text-herbal-muted">
                  {plant.locationStatus}
                </p>
              </div>
              <div className="rounded-md border border-herbal-green/10 bg-white p-5 text-center shadow-sm">
                <div className="mx-auto grid aspect-square max-w-36 grid-cols-4 gap-1 rounded-md bg-herbal-soft p-3">
                  {Array.from({ length: 16 }).map((_, index) => (
                    <span
                      className={
                        index % 2 === 0 || index === 5
                          ? "rounded-sm bg-herbal-green"
                          : "rounded-sm bg-white"
                      }
                      key={index}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-herbal-muted">
                  QR Code akan tersedia setelah halaman dipublikasikan.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="green">{plant.category}</StatusBadge>
              <StatusBadge tone="brown">
                {getValidationStatusLabel(plant.validationStatus)}
              </StatusBadge>
              {posterPlant?.imageIsIllustration ? (
                <StatusBadge tone="brown">Ilustrasi referensi</StatusBadge>
              ) : null}
            </div>
            <h1 className="mt-5 text-4xl font-bold text-herbal-ink sm:text-5xl">
              {plant.localName}
            </h1>
            <p className="mt-2 text-lg italic text-herbal-muted">
              {plant.scientificName}
            </p>
            {plant.otherNames.length > 0 ? (
              <p className="mt-3 text-sm text-herbal-muted">
                Nama lain: {plant.otherNames.join(", ")}
              </p>
            ) : null}
            <p className="mt-6 text-base leading-8 text-herbal-muted">
              {plant.description}
            </p>

            <div className="mt-8 grid gap-6">
              <DetailSection title="Bagian yang dimanfaatkan" values={plant.usedParts} />
              <DetailSection
                title="Pemanfaatan tradisional"
                values={plant.traditionalUses}
              />
              <DetailSection title="Cara pengolahan" values={plant.preparation} />
              <DetailSection
                title="Cara perawatan"
                values={plant.careInstructions}
              />
              <DetailSection title="Peringatan" values={plant.warnings} />
            </div>

            <div className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm">
              <h2 className="text-base font-bold text-herbal-ink">
                Sumber dan status validasi
              </h2>
              <p className="mt-3">{plant.source}</p>
              <p className="mt-2">{plant.validator}</p>
            </div>
            {posterPlant ? <PosterOccurrencePanel plant={posterPlant} /> : null}

            <div className="mt-8">
              <Disclaimer>
                Informasi tanaman dan ramuan pada website ini disediakan untuk
                edukasi mengenai pemanfaatan tradisional. Informasi ini bukan
                diagnosis, resep, atau pengganti konsultasi dengan dokter,
                apoteker, maupun tenaga kesehatan lainnya.
              </Disclaimer>
            </div>
          </div>
        </div>
      </Container>
    </article>
  );
}

function PosterOnlyPlantDetail({ plant }: { plant: PosterPlantCatalogItem }) {
  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[{ label: "Tanaman", href: "/tanaman" }, { label: plant.rawName }]}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SafeImage
              alt={
                plant.imageIsIllustration
                  ? `Ilustrasi referensi untuk tanaman ${plant.rawName}`
                  : `Foto tanaman ${plant.rawName}`
              }
              fallbackLabel={`Ilustrasi placeholder tanaman ${plant.rawName}`}
              fallbackVariant="plant"
              imageClassName="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
              src={plant.image}
            />
            {plant.attributionText || plant.sourcePageUrl ? (
              <div className="mt-4 rounded-md border border-herbal-green/10 bg-white p-4 text-sm leading-6 text-herbal-muted shadow-sm">
                <h2 className="font-bold text-herbal-ink">Sumber gambar</h2>
                {plant.attributionText ? <p className="mt-2">{plant.attributionText}</p> : null}
                {plant.sourcePageUrl ? (
                  <a
                    className="mt-2 inline-block font-semibold text-herbal-green hover:underline"
                    href={plant.sourcePageUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Halaman sumber
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="brown">Nama dari poster</StatusBadge>
              {plant.imageIsIllustration ? (
                <StatusBadge tone="brown">Ilustrasi referensi</StatusBadge>
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
            <p className="mt-6 text-base leading-8 text-herbal-muted">
              Nama ini dicantumkan pada poster Kampung Herbal Harmony.
            </p>
            <PosterOccurrencePanel plant={plant} />
            <div className="mt-8">
              <Disclaimer>
                Informasi tanaman pada website ini disediakan untuk edukasi
                mengenai pemanfaatan tradisional. Informasi ini bukan diagnosis,
                resep, atau pengganti konsultasi dengan dokter, apoteker, maupun
                tenaga kesehatan lainnya.
              </Disclaimer>
            </div>
          </div>
        </div>
      </Container>
    </article>
  );
}

function PosterOccurrencePanel({ plant }: { plant: PosterPlantCatalogItem }) {
  return (
    <section className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm">
      <h2 className="text-base font-bold text-herbal-ink">
        Kemunculan pada poster
      </h2>
      <p className="mt-3">
        Muncul {plant.posterOccurrenceCount} kali pada nomor poster{" "}
        {plant.posterNumbers.join(", ")}.
      </p>
      <p className="mt-2">Zona: {plant.collections.join(", ")}.</p>
      <p className="mt-2">Sumber: {plant.sourceLabel}.</p>
    </section>
  );
}

type DetailSectionProps = {
  title: string;
  values: string[];
};

function DetailSection({ title, values }: DetailSectionProps) {
  return (
    <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-herbal-ink">{title}</h2>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-herbal-muted">
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
