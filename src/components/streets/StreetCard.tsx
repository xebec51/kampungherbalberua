import Image from "next/image";
import Link from "next/link";
import type { PublicStreet } from "@/lib/data/streets";

type StreetCardProps = {
  compact?: boolean;
  priority?: boolean;
  street: PublicStreet;
};

export function StreetCard({
  compact = false,
  priority = false,
  street,
}: StreetCardProps) {
  return (
    <Link
      aria-label={`Buka detail ${street.streetName}`}
      className={
        compact
          ? "group public-card relative flex min-h-32 flex-col overflow-hidden rounded-[var(--radius-card)] border border-herbal-brown/20 bg-white shadow-[var(--shadow-soft)] transition hover:border-herbal-brown/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          : "group public-card relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-herbal-brown/20 bg-white shadow-[var(--shadow-soft)] transition hover:border-herbal-brown/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
      }
      href={`/jalan/${street.slug}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-1 bg-[repeating-linear-gradient(90deg,#7C592D_0_2rem,#E5BA21_2rem_2.55rem,transparent_2.55rem_3rem)]"
      />
      {street.imagePath ? (
        <div className={compact ? "relative aspect-[16/9]" : "relative aspect-[4/3]"}>
          <Image
            alt={street.imageAlt}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            fill
            priority={priority}
            sizes={
              compact
                ? "(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 18rem"
                : "(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 26rem"
            }
            src={street.imagePath}
          />
        </div>
      ) : null}
      <div className={compact ? "flex flex-1 flex-col p-4" : "flex flex-1 flex-col p-5"}>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
          Jalan tematik
        </p>
        <h3
          className={
            compact
              ? "mt-2 text-base font-bold leading-tight text-herbal-ink"
              : "mt-3 text-lg font-bold leading-tight text-herbal-ink"
          }
        >
          {street.streetName}
        </h3>
        {street.description && !compact ? (
          <p className="mt-3 text-sm leading-6 text-herbal-muted">
            {street.description}
          </p>
        ) : null}
        <p className="mt-auto pt-3 text-sm font-bold text-herbal-green">
          {street.plantCount} entri tanaman
        </p>
      </div>
    </Link>
  );
}
