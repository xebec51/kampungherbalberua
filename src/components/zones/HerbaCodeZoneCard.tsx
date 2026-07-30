import Link from "next/link";
import type { HerbaCodeZoneSummary } from "@/types";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

type HerbaCodeZoneCardProps = {
  zone: HerbaCodeZoneSummary;
};

export function HerbaCodeZoneCard({ zone }: HerbaCodeZoneCardProps) {
  return (
    <PublicCard>
      <div className="brand-pattern relative min-h-28 bg-herbal-green px-5 py-5 text-white">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-lg font-bold text-herbal-gold ring-1 ring-white/18">
          {zone.title.replace(/^Zona\s+/i, "").slice(0, 1)}
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-white/72">
          Zona kesehatan
        </p>
      </div>
      <PublicCardBody>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="green">Zona HerbaCode</StatusBadge>
          <StatusBadge tone="brown">{zone.plantCount} tanaman</StatusBadge>
        </div>
        <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-tight text-herbal-ink">
          <Link
            className="transition hover:text-herbal-green"
            href={`/zona-kesehatan/${zone.slug}`}
          >
            {zone.title}
          </Link>
        </h3>
        {zone.streetNames.length > 0 ? (
          <p className="mt-2 text-sm font-semibold text-herbal-green">
            {zone.streetNames.join(", ")}
          </p>
        ) : null}
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-herbal-muted">
          Data tanaman dan pemanfaatan tradisional pada zona ini bersumber dari HerbaCode.
        </p>
        <PublicCardAction href={`/zona-kesehatan/${zone.slug}`}>
          Lihat detail zona
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
