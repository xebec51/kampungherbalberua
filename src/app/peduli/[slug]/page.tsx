import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  ListChecks,
} from "lucide-react";
import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { peduliDisclaimer, peduliSource } from "@/data/peduli";
import {
  getPeduliGuidanceBySlug,
  getPeduliGuidanceSlugs,
  getPeduliZoneById,
  getPeduliZones,
} from "@/lib/data/peduli";
import { createPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

type PeduliDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type DetailSectionProps = {
  title: string;
  items: string[];
  icon: ReactNode;
  emptyLabel?: string;
  tone?: "default" | "warning" | "support";
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPeduliGuidanceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PeduliDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guidance = await getPeduliGuidanceBySlug(slug);

  if (!guidance) {
    return createPageMetadata({
      title: "Panduan PEDULI tidak ditemukan",
      description: "Panduan PEDULI yang diminta tidak tersedia.",
      path: "/peduli",
    });
  }

  return createPageMetadata({
    title: `${guidance.title} - PEDULI`,
    description: `${guidance.title} dalam ${peduliSource.title}.`,
    path: `/peduli/${guidance.slug}`,
  });
}

function DetailSection({
  emptyLabel = "Tidak tercantum sebagai bagian terpisah pada Buku Saku PEDULI untuk kelompok ini.",
  icon,
  items,
  title,
  tone = "default",
}: DetailSectionProps) {
  const toneClass = {
    default: "border-[#24186f]/12 bg-white",
    support: "border-herbal-green/15 bg-white",
    warning: "border-herbal-brown/18 bg-[#fffaf0]",
  }[tone];

  return (
    <section className={cn("rounded-md border p-5 shadow-sm", toneClass)}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f3f0df] text-[#24186f]">
          {icon}
        </span>
        <h2 className="text-xl font-extrabold text-herbal-ink">{title}</h2>
      </div>
      {items.length > 0 ? (
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-herbal-muted">
          {items.map((item) => (
            <li className="flex gap-3" key={item}>
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#24186f]"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-herbal-muted">{emptyLabel}</p>
      )}
    </section>
  );
}

export default async function PeduliDetailPage({ params }: PeduliDetailPageProps) {
  const { slug } = await params;
  const guidance = await getPeduliGuidanceBySlug(slug);

  if (!guidance) {
    notFound();
  }

  const [zone, zones] = await Promise.all([
    getPeduliZoneById(guidance.zoneId),
    getPeduliZones(),
  ]);
  const currentZone = zones.find((item) => item.id === guidance.zoneId);

  return (
    <main className="bg-[#f8f5e8] text-herbal-ink">
      <article className="py-8 sm:py-10 lg:py-12">
        <Container>
          <Breadcrumb
            items={[
              { label: "PEDULI", href: "/peduli" },
              { label: guidance.title },
            ]}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <div>
              <header className="rounded-md border border-[#24186f]/12 bg-white p-5 shadow-[0_18px_44px_rgba(16,18,42,0.08)] sm:p-7">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7c592d]">
                  {zone?.title ?? "PEDULI"}
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[#24186f] sm:text-5xl">
                  {guidance.title}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                  <span className="rounded-md bg-[#f3f0df] px-3 py-1.5 text-[#24186f]">
                    {guidance.englishTitle}
                  </span>
                  {guidance.ageRange ? (
                    <span className="rounded-md bg-herbal-soft px-3 py-1.5 text-herbal-green">
                      {guidance.ageRange}
                    </span>
                  ) : null}
                  <span className="rounded-md bg-[#fff4d6] px-3 py-1.5 text-herbal-brown">
                    Halaman sumber {guidance.sourcePages.join(", ")}
                  </span>
                </div>
                <div className="mt-6 rounded-md border border-[#24186f]/12 bg-[#f8f5e8] p-4 text-sm leading-6 text-herbal-muted">
                  <strong className="block text-herbal-ink">
                    Panduan edukatif
                  </strong>
                  <span>{peduliDisclaimer}</span>
                </div>
              </header>

              <section className="mt-8 rounded-md border border-[#24186f]/12 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f3f0df] text-[#24186f]">
                    <BookOpen aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-extrabold text-herbal-ink">
                    Karakteristik Utama
                  </h2>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {guidance.characteristics.map((characteristic) => (
                    <section
                      className="rounded-md border border-[#24186f]/10 bg-[#fbfaf3] p-4"
                      key={characteristic.title}
                    >
                      <h3 className="text-base font-extrabold text-[#24186f]">
                        {characteristic.title}
                      </h3>
                      {characteristic.paragraphs ? (
                        <div className="mt-3 grid gap-3 text-sm leading-7 text-herbal-muted">
                          {characteristic.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      ) : null}
                      {characteristic.items ? (
                        <ul className="mt-3 grid gap-3 text-sm leading-6 text-herbal-muted">
                          {characteristic.items.map((item) => (
                            <li className="flex gap-3" key={item}>
                              <span
                                aria-hidden="true"
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#24186f]"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                </div>
              </section>

              <div className="mt-6 grid gap-5">
                <DetailSection
                  icon={<CheckCircle2 aria-hidden="true" className="h-5 w-5" />}
                  items={guidance.mainNeeds}
                  title="Kebutuhan Utama"
                  tone="support"
                />
                <DetailSection
                  icon={<AlertTriangle aria-hidden="true" className="h-5 w-5" />}
                  items={guidance.avoidances}
                  title="Hal yang Perlu Dihindari"
                  tone="warning"
                />
                <DetailSection
                  icon={<HeartHandshake aria-hidden="true" className="h-5 w-5" />}
                  items={guidance.generalApproach}
                  title="Pendekatan Umum"
                />
                <DetailSection
                  icon={<ListChecks aria-hidden="true" className="h-5 w-5" />}
                  items={guidance.recommendedInterventions}
                  title="Rekomendasi Intervensi"
                />
              </div>
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="rounded-md border border-[#24186f]/12 bg-white p-4 shadow-[0_16px_36px_rgba(16,18,42,0.08)]">
                <Link
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#24186f] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24186f]"
                  href="/peduli"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Kembali ke PEDULI
                </Link>
                <h2 className="mt-5 text-base font-extrabold text-herbal-ink">
                  {currentZone?.title ?? "Kelompok PEDULI"}
                </h2>
                <nav aria-label="Panduan dalam zona ini" className="mt-3 grid gap-2">
                  {currentZone?.guidance.map((item) => (
                    <Link
                      aria-current={item.slug === guidance.slug ? "page" : undefined}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24186f]",
                        item.slug === guidance.slug
                          ? "border-[#24186f] bg-[#24186f] text-white"
                          : "border-[#24186f]/12 bg-[#fbfaf3] text-herbal-ink hover:border-[#24186f]/30 hover:bg-[#f3f0df]",
                      )}
                      href={`/peduli/${item.slug}`}
                      key={item.id}
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        </Container>
      </article>
    </main>
  );
}
