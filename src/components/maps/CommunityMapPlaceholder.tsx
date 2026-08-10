import Image from "next/image";
import Link from "next/link";
import { communityMapConfig } from "@/data/map-config";
import { cn } from "@/lib/utils";

type CommunityMapPlaceholderProps = {
  compact?: boolean;
};

export function CommunityMapPlaceholder({
  compact = false,
}: CommunityMapPlaceholderProps) {
  const image = (
    <div
      className="relative w-full overflow-hidden rounded-[var(--radius-card)] border border-herbal-green/12 bg-herbal-mist"
      style={{
        aspectRatio: `${communityMapConfig.mapImageWidth} / ${communityMapConfig.mapImageHeight}`,
      }}
    >
      <Image
        alt={`Peta visual ${communityMapConfig.locationName} -- ${communityMapConfig.mapTitle}`}
        className="object-contain"
        fill
        priority={!compact}
        sizes={compact ? "(max-width: 1024px) 100vw, 55vw" : "100vw"}
        src={communityMapConfig.mapImageSrc}
      />
    </div>
  );

  return (
    <section
      aria-labelledby={compact ? "home-map-preview-title" : "community-map-title"}
      className={cn(
        "rounded-[var(--radius-card)] border border-herbal-green/12 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5",
      )}
    >
      <span className="inline-flex rounded-full border border-herbal-brown/30 bg-[#F5E9DF] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
        {communityMapConfig.mapStatus}
      </span>
      <h2
        className={cn(
          "mt-3 font-bold leading-tight text-herbal-ink",
          compact ? "text-2xl" : "text-3xl sm:text-4xl",
        )}
        id={compact ? "home-map-preview-title" : "community-map-title"}
      >
        {communityMapConfig.mapTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-herbal-muted sm:text-base">
        Denah kompleks Kampung Herbal Berua disusun oleh{" "}
        {communityMapConfig.mapPreparedBy}, memetakan jalan tematik, zona
        kesehatan, dan fasilitas kampung.
      </p>

      <div className="mt-4">
        {compact ? (
          <Link
            aria-label={`Lihat ${communityMapConfig.mapTitle} ukuran penuh`}
            className="block rounded-[var(--radius-card)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-herbal-brown"
            href="/peta"
          >
            {image}
          </Link>
        ) : (
          image
        )}
      </div>

      {!compact ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-herbal-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            href={communityMapConfig.mapImageDownloadSrc}
            download
          >
            Unduh Peta Resolusi Tinggi (PNG)
          </a>
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            href={communityMapConfig.mapImageSrc}
            rel="noopener noreferrer"
            target="_blank"
          >
            Buka Gambar Ukuran Penuh
          </a>
        </div>
      ) : null}
    </section>
  );
}
