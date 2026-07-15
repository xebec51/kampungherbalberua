import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getPlantBySlug, plants } from "@/data/plants";
import { getValidationStatusLabel } from "@/lib/formatters";

type PlantDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return plants
    .filter((plant) => plant.published)
    .map((plant) => ({ slug: plant.slug }));
}

export async function generateMetadata({
  params,
}: PlantDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const plant = getPlantBySlug(slug);

  if (!plant) {
    return {
      title: "Tanaman tidak ditemukan | Kampung Herbal Berua",
    };
  }

  return {
    title: `${plant.localName} | Tanaman TOGA Kampung Herbal Berua`,
    description: plant.shortDescription,
  };
}

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { slug } = await params;
  const plant = getPlantBySlug(slug);

  if (!plant) {
    notFound();
  }

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
            <ImagePlaceholder
              label={`Ilustrasi placeholder tanaman ${plant.localName}`}
              variant="plant"
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
