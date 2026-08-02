import { communityMapLegend } from "@/data/map-config";
import { cn } from "@/lib/utils";

export function MapLegend() {
  return (
    <section
      aria-labelledby="map-legend-title"
      className="rounded-[var(--radius-card)] border border-herbal-green/12 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-herbal-brown">
        Legenda peta
      </p>
      <h2
        className="mt-3 text-xl font-bold leading-tight text-herbal-ink"
        id="map-legend-title"
      >
        Kategori pada Peta
      </h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {communityMapLegend.map((item) => (
          <li
            className="rounded-md border border-herbal-green/10 bg-herbal-mist p-4"
            key={item.id}
          >
            <span
              aria-hidden="true"
              className={cn(
                "block h-3 w-10 rounded-full",
                item.swatchClassName,
              )}
            />
            <h3 className="mt-3 text-sm font-bold text-herbal-ink">
              {item.label}
            </h3>
            <p className="mt-2 text-xs leading-5 text-herbal-muted">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
