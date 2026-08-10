"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import { communityMapConfig } from "@/data/map-config";

// Resolved once from communityMapConfig.googleMapsUrl (the site's own public
// map link) -- kept as plain constants rather than re-deriving them at
// runtime, since a short link can't be parsed client-side without a network
// round trip.
const complexCoordinates: [number, number] = [119.521675, -5.116003];

export function InteractiveMap() {
  return (
    <section
      aria-labelledby="interactive-map-title"
      className="rounded-[var(--radius-card)] border border-herbal-green/12 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-herbal-brown">
        Peta interaktif
      </p>
      <h2
        className="mt-3 text-xl font-bold leading-tight text-herbal-ink"
        id="interactive-map-title"
      >
        Temukan Lokasi Kampung
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-herbal-muted">
        Geser dan perbesar peta untuk menemukan rute menuju{" "}
        {communityMapConfig.locationName}. Peta ini hanya menampilkan satu
        titik lokasi kompleks, tanpa data pribadi warga.
      </p>
      <div className="relative mt-5 h-[22rem] w-full overflow-hidden rounded-md border border-herbal-green/15">
        <Map center={complexCoordinates} theme="light" zoom={16}>
          <MapControls showLocate showZoom />
          <MapMarker latitude={complexCoordinates[1]} longitude={complexCoordinates[0]}>
            <MarkerContent>
              <div className="h-4 w-4 rounded-full border-2 border-white bg-herbal-green shadow-lg" />
            </MarkerContent>
            <MarkerPopup>
              <p className="text-sm font-bold text-herbal-ink">
                {communityMapConfig.locationName}
              </p>
              {communityMapConfig.regionLines.map((line) => (
                <span className="block text-xs text-herbal-muted" key={line}>
                  {line}
                </span>
              ))}
              <a
                className="mt-2 inline-block text-xs font-bold text-herbal-green hover:underline"
                href={communityMapConfig.googleMapsUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Buka di Google Maps
              </a>
            </MarkerPopup>
          </MapMarker>
        </Map>
      </div>
    </section>
  );
}
