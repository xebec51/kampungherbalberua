import { communityMapConfig } from "@/data/map-config";

export function MapLocationCard() {
  return (
    <section
      aria-labelledby="map-location-title"
      className="rounded-[var(--radius-card)] border border-herbal-green/12 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-herbal-brown">
        Lokasi kompleks
      </p>
      <h2
        className="mt-3 text-2xl font-bold leading-tight text-herbal-ink"
        id="map-location-title"
      >
        Lokasi {communityMapConfig.locationName}
      </h2>
      <address className="mt-4 not-italic text-sm leading-7 text-herbal-muted">
        {communityMapConfig.regionLines.map((line) => (
          <span className="block" key={line}>
            {line}
          </span>
        ))}
      </address>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-gold px-5 py-2.5 text-sm font-bold text-herbal-ink shadow-[0_12px_28px_rgba(7,25,15,0.16)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-gold"
          href={communityMapConfig.googleMapsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Buka di Google Maps
        </a>
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-herbal-green/70 bg-white px-5 py-2.5 text-sm font-bold text-herbal-deep transition hover:-translate-y-0.5 hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          href={communityMapConfig.googleMapsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Petunjuk Arah
        </a>
      </div>
    </section>
  );
}
