import { Download, ExternalLink, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ageDistributionMapConfig } from "@/data/age-distribution-map";

export function AgeDistributionMapSection() {
  const config = ageDistributionMapConfig;
  const imageRatio = `${config.displayImage.width} / ${config.displayImage.height}`;

  return (
    <section
      aria-labelledby="age-distribution-map-title"
      className="mt-12 scroll-mt-28 sm:scroll-mt-32"
      id="peta-kelompok-usia"
    >
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-herbal-green/12 bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-white/70 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-[#0A2D78]/20 bg-[#EAF0FF] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#0A2D78]">
              Proker terakhir
            </span>
            <h2
              className="mt-3 text-2xl font-bold leading-tight tracking-normal text-herbal-ink sm:text-3xl lg:text-[2.15rem]"
              id="age-distribution-map-title"
            >
              {config.title}
            </h2>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-herbal-brown sm:text-base">
              {config.location}
            </p>
            <p
              className="mt-3 text-sm leading-6 text-herbal-muted sm:text-base"
              id="age-distribution-map-source"
            >
              {config.sourceNote}
            </p>
          </div>

          <div className="w-fit rounded-md bg-[#0A2D78] px-4 py-3 text-sm font-bold leading-6 text-white shadow-[0_12px_28px_rgba(10,45,120,0.16)]">
            {config.sourceLabel}
          </div>
        </div>

        <figure className="mt-6">
          <div
            aria-label={`Area gulir ${config.title}`}
            className="overflow-x-auto rounded-md border border-herbal-green/12 bg-[#F7FAF8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-herbal-brown"
            role="region"
            tabIndex={0}
          >
            <div
              className="relative min-w-[760px] sm:min-w-0"
              style={{ aspectRatio: imageRatio }}
            >
              <Image
                alt={config.altText}
                aria-describedby="age-distribution-map-source age-distribution-map-privacy"
                className="object-contain"
                fill
                sizes="(max-width: 640px) 760px, (max-width: 1024px) 100vw, 1184px"
                src={config.displayImage.src}
              />
            </div>
          </div>
          <figcaption className="mt-3 text-xs leading-5 text-herbal-muted sm:text-sm">
            {config.altText}
          </figcaption>
        </figure>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-herbal-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            download
            href={config.downloadImage.src}
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            <span>Unduh PNG Resolusi Tinggi</span>
          </a>
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-herbal-green bg-white px-4 py-2.5 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            href={config.displayImage.src}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            <span>Buka Gambar Ukuran Penuh</span>
          </a>
        </div>

        <div className="mt-5 flex gap-3 rounded-md border border-herbal-green/12 bg-herbal-soft/75 p-4">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-herbal-green"
          />
          <p
            className="text-sm leading-6 text-herbal-muted"
            id="age-distribution-map-privacy"
          >
            {config.privacyNote}
          </p>
        </div>
      </div>
    </section>
  );
}
