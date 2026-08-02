import Link from "next/link";
import type { HerbaCodeZoneSummary } from "@/types";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ZoneIcon } from "@/components/zones/ZoneIcon";

type HerbaCodeZoneCardProps = {
  zone: HerbaCodeZoneSummary;
};

export function HerbaCodeZoneCard({ zone }: HerbaCodeZoneCardProps) {
  return (
    <PublicCard>
      <div className="brand-pattern relative min-h-24 bg-herbal-green px-4 py-4 text-white sm:min-h-28 sm:px-5 sm:py-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.7rem] bg-white/12 text-herbal-gold ring-1 ring-white/18 sm:h-11 sm:w-11 sm:rounded-xl">
          <ZoneIcon className="h-5 w-5 sm:h-6 sm:w-6" zoneSlug={zone.slug} />
        </span>
        <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/72 sm:mt-4 sm:text-xs sm:tracking-[0.14em]">
          Zona kesehatan
        </p>
      </div>
      <PublicCardBody>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="green">Zona HerbaCode</StatusBadge>
          <StatusBadge tone="brown">{zone.plantCount} tanaman</StatusBadge>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:mt-4 sm:text-lg">
          <Link
            className="transition hover:text-herbal-green"
            href={`/zona-kesehatan/${zone.slug}`}
          >
            {zone.title}
          </Link>
        </h3>
        {zone.streetNames.length > 0 ? (
          <p className="mt-1.5 line-clamp-1 text-xs font-semibold text-herbal-green sm:mt-2 sm:text-sm">
            {zone.streetNames.join(", ")}
          </p>
        ) : null}
        <p
          className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6"
          data-zone-description
        >
          {zone.shortDescription}
        </p>
        <PublicCardAction href={`/zona-kesehatan/${zone.slug}`}>
          Lihat detail zona
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
