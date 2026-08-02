import { communityMapConfig } from "@/data/map-config";
import { cn } from "@/lib/utils";

type CommunityMapPlaceholderProps = {
  compact?: boolean;
};

export function CommunityMapPlaceholder({
  compact = false,
}: CommunityMapPlaceholderProps) {
  return (
    <section
      aria-labelledby={compact ? "home-map-preview-title" : "community-map-title"}
      className={cn(
        "brand-pattern relative overflow-hidden rounded-[var(--radius-card)] border border-herbal-green/12 bg-herbal-green text-white shadow-[var(--shadow-soft)]",
        compact ? "min-h-64" : "min-h-[22rem]",
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,241,221,0.12)_0_1px,transparent_1px_3.2rem),linear-gradient(45deg,rgba(137,187,94,0.16)_0_1px,transparent_1px_2.4rem)]"
      />
      <div className="absolute inset-x-6 top-8 h-px bg-white/18" aria-hidden="true" />
      <div className="absolute inset-y-8 left-8 w-px bg-white/18" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute right-7 top-7 h-16 w-16 rounded-full border border-herbal-gold/50"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-7 left-7 h-14 w-24 rounded-full border border-white/20 bg-white/5"
      />

      <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-between p-5 sm:p-7">
        <div className="max-w-xl">
          <span className="inline-flex rounded-full border border-herbal-gold/40 bg-herbal-gold px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-herbal-ink">
            {communityMapConfig.mapStatus}
          </span>
          <h2
            className={cn(
              "mt-4 font-bold leading-tight",
              compact ? "text-2xl" : "text-3xl sm:text-4xl",
            )}
            id={compact ? "home-map-preview-title" : "community-map-title"}
          >
            {communityMapConfig.mapTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 sm:text-base">
            Denah kompleks Kampung Herbal Berua disusun oleh{" "}
            {communityMapConfig.mapPreparedBy}, memetakan jalan tematik, zona
            kesehatan, dan fasilitas kampung.
          </p>
        </div>
        <div className="mt-8 grid gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 sm:grid-cols-3">
          <span className="rounded-md border border-white/14 bg-white/8 px-3 py-2">
            Jalan
          </span>
          <span className="rounded-md border border-white/14 bg-white/8 px-3 py-2">
            Zona
          </span>
          <span className="rounded-md border border-white/14 bg-white/8 px-3 py-2">
            Fasilitas
          </span>
        </div>
      </div>
    </section>
  );
}
