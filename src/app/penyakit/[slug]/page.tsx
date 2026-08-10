import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { HealthConditionIcon } from "@/components/health-conditions/HealthConditionIcon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import {
  getHealthConditionBySlug,
  getHealthConditionSlugs,
} from "@/lib/data/health-conditions";
import { createPageMetadata } from "@/lib/metadata";

type HealthConditionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Unlike /produk/[slug] (dynamicParams = false), this stays dynamic: a
// health condition created via /admin/penyakit must be viewable immediately
// (no draft/publish workflow, no wait for the next deploy's
// generateStaticParams run) -- matching the "instantly live" design this
// entity was explicitly built for.
export async function generateStaticParams() {
  const slugs = await getHealthConditionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: HealthConditionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const healthCondition = await getHealthConditionBySlug(slug);

  if (!healthCondition) {
    return createPageMetadata({
      title: "Penyakit tidak ditemukan",
      description: "Data penyakit yang diminta tidak tersedia.",
      path: "/penyakit",
    });
  }

  return createPageMetadata({
    title: healthCondition.name,
    description: healthCondition.shortDescription,
    path: `/penyakit/${healthCondition.slug}`,
  });
}

export default async function HealthConditionDetailPage({
  params,
}: HealthConditionDetailPageProps) {
  const { slug } = await params;
  const healthCondition = await getHealthConditionBySlug(slug);

  if (!healthCondition) {
    notFound();
  }

  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[
            { label: "Katalog Penyakit", href: "/penyakit" },
            { label: healthCondition.name },
          ]}
        />
        <Reveal>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center justify-center rounded-[var(--radius-card)] border border-herbal-green/10 bg-herbal-soft p-10 shadow-[var(--shadow-soft)]">
              <HealthConditionIcon
                className="h-24 w-24 text-herbal-green sm:h-32 sm:w-32"
                slug={healthCondition.slug}
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold text-herbal-ink sm:text-5xl">
                {healthCondition.name}
              </h1>
              <p className="mt-5 text-base leading-8 text-herbal-muted">
                {healthCondition.description}
              </p>

              {healthCondition.benefits.length > 0 ? (
                <section className="mt-8">
                  <h2 className="text-lg font-bold text-herbal-ink">Manfaat</h2>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-herbal-muted">
                    {healthCondition.benefits.map((benefit) => (
                      <li className="flex gap-2" key={benefit}>
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-herbal-green"
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {healthCondition.linkedPlants.length > 0 ? (
                <section className="mt-8">
                  <h2 className="text-lg font-bold text-herbal-ink">
                    Tanaman terkait
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {healthCondition.linkedPlants.map((link) =>
                      link.plantSlug ? (
                        <Link
                          className="inline-flex items-center rounded-full border border-herbal-green/30 bg-white px-3 py-1.5 text-sm font-semibold text-herbal-green transition hover:border-herbal-green hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                          href={`/tanaman/${link.plantSlug}`}
                          key={link.displayName}
                        >
                          {link.displayName}
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full border border-herbal-green/15 bg-herbal-mist px-3 py-1.5 text-sm font-semibold text-herbal-muted"
                          key={link.displayName}
                        >
                          {link.displayName}
                        </span>
                      ),
                    )}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </Reveal>

        <div className="mt-8">
          <Disclaimer>
            Informasi penyakit dan tanaman pada halaman ini disediakan untuk
            edukasi mengenai pemanfaatan tradisional. Informasi ini bukan
            diagnosis, resep, atau pengganti konsultasi dengan dokter, apoteker,
            maupun tenaga kesehatan lainnya.
          </Disclaimer>
        </div>
      </Container>
    </article>
  );
}
