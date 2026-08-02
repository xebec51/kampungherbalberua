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
      <div className={compact ? "flex flex-1 flex-col p-3 sm:p-4" : "flex flex-1 flex-col p-3.5 sm:p-5"}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-herbal-brown sm:text-xs">
          Jalan tematik
        </p>
        <h3
          className={
            compact
              ? "mt-2 line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:text-base"
              : "mt-2 line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:mt-3 sm:text-lg"
          }
        >
          {street.streetName}
        </h3>
        {street.description && !compact ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-6">
            {street.description}
          </p>
        ) : null}
        <p className="mt-auto pt-2 text-xs font-bold text-herbal-green sm:pt-3 sm:text-sm">
          {street.plantCount} entri tanaman
        </p>
      </div>
    </Link>
  );
}
