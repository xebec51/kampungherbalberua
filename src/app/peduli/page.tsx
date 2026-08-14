import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, HeartHandshake } from "lucide-react";
import { PeduliGuidanceCard } from "@/components/peduli/PeduliGuidanceCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import {
  peduliDisclaimer,
  peduliIntroduction,
  peduliPreface,
  peduliSource,
} from "@/data/peduli";
import { getPeduliZones } from "@/lib/data/peduli";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "PEDULI",
  description: peduliPreface,
  path: "/peduli",
});

export default async function PeduliPage() {
  const zones = await getPeduliZones();
  const guidanceCount = zones.reduce((total, zone) => total + zone.guidance.length, 0);

  return (
    <main className="bg-[#f8f5e8] text-herbal-ink">
      <section className="border-b border-[#24186f]/10 bg-[#f3f0df] py-8 sm:py-10 lg:py-12">
        <Container>
          <Breadcrumb items={[{ label: "PEDULI" }]} />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7c592d]">
                {peduliSource.subtitle}
              </p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[#24186f] sm:text-5xl lg:text-6xl">
                PEDULI
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-herbal-muted sm:text-lg">
                {peduliPreface}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#24186f] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(36,24,111,0.2)] transition hover:bg-[#342488] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24186f]"
                  href="#zona-anak"
                >
                  Mulai dari Zona Anak
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#24186f]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#24186f] transition hover:border-[#24186f]/35 hover:bg-[#faf8ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24186f]"
                  href="/tentang"
                >
                  Identitas program
                </Link>
              </div>
            </div>

            <aside className="rounded-md border border-white/20 bg-[#24186f] p-5 text-white shadow-[0_24px_54px_rgba(36,24,111,0.22)] sm:p-6">
              <div className="rounded-md bg-white p-3">
                <Image
                  alt="Logo Kampung Herbal Harmony Berua"
                  className="h-auto w-full"
                  height={180}
                  priority
                  src="/brand/logo/kampung-herbal-wide-main.png"
                  width={512}
                />
              </div>
              <div className="mt-5 grid gap-4 text-sm leading-6 text-white/78">
                <p className="text-lg font-extrabold text-white">
                  {peduliSource.title}
                </p>
                <p>{peduliSource.program}</p>
                <p>{peduliSource.location}</p>
              </div>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-bold text-white/70">
                    {peduliSource.author.label}
                  </dt>
                  <dd className="mt-1 font-semibold text-white">
                    {peduliSource.author.name}
                  </dd>
                  <dd className="text-white/72">
                    {peduliSource.author.studyProgram}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-white/70">
                    {peduliSource.supervisor.label}
                  </dt>
                  <dd className="mt-1 font-semibold text-white">
                    {peduliSource.supervisor.name}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <div className="grid gap-4 rounded-md border border-[#24186f]/12 bg-white p-5 shadow-[0_16px_36px_rgba(16,18,42,0.08)] sm:grid-cols-[auto_1fr] sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#fff4d6] text-[#24186f]">
              <HeartHandshake aria-hidden="true" className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-herbal-ink">
                Panduan edukatif
              </h2>
              <p className="mt-2 text-sm leading-6 text-herbal-muted">
                {peduliDisclaimer}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-12 sm:pb-16">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7c592d]">
                Struktur utama
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-herbal-ink sm:text-4xl">
                Tiga Zona PEDULI
              </h2>
              <p className="mt-4 text-sm leading-7 text-herbal-muted sm:text-base sm:leading-8">
                {peduliIntroduction}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {zones.map((zone) => (
                <a
                  className="rounded-md border border-[#24186f]/12 bg-white p-4 text-sm font-bold text-[#24186f] shadow-sm transition hover:border-[#24186f]/30 hover:bg-[#faf8ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24186f]"
                  href={`#zona-${zone.id}`}
                  key={zone.id}
                >
                  <span className="block">{zone.title}</span>
                  <span className="mt-1 block text-xs font-semibold text-herbal-muted">
                    {zone.guidance.length} panduan
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-10">
            {zones.map((zone) => (
              <section
                className="scroll-mt-28"
                id={`zona-${zone.id}`}
                key={zone.id}
              >
                <div className="flex flex-col gap-3 border-b border-[#24186f]/12 pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7c592d]">
                      {zone.guidance.length} dari {guidanceCount} panduan
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold text-[#24186f]">
                      {zone.title}
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-herbal-muted">
                      {zone.description}
                    </p>
                  </div>
                  <BookOpen
                    aria-hidden="true"
                    className="hidden h-8 w-8 text-[#24186f]/55 sm:block"
                  />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {zone.guidance.map((guidance) => (
                    <PeduliGuidanceCard guidance={guidance} key={guidance.id} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
