import Link from "next/link";
import { ArrowRight, Baby, ShieldCheck, Users } from "lucide-react";
import type { PeduliGuidance, PeduliZoneId } from "@/data/peduli";
import { cn } from "@/lib/utils";

type PeduliGuidanceCardProps = {
  guidance: PeduliGuidance;
  compact?: boolean;
};

const zoneStyles: Record<
  PeduliZoneId,
  {
    accent: string;
    icon: typeof Baby;
    surface: string;
  }
> = {
  anak: {
    accent: "text-[#24186f]",
    icon: Baby,
    surface: "bg-[#f3f0df]",
  },
  dewasa: {
    accent: "text-herbal-green",
    icon: Users,
    surface: "bg-herbal-soft",
  },
  rentan: {
    accent: "text-herbal-brown",
    icon: ShieldCheck,
    surface: "bg-[#fff4d6]",
  },
};

export function PeduliGuidanceCard({
  compact = false,
  guidance,
}: PeduliGuidanceCardProps) {
  const style = zoneStyles[guidance.zoneId];
  const Icon = style.icon;

  return (
    <Link
      aria-label={`Buka panduan ${guidance.title}`}
      className="group block h-full rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#24186f]"
      href={`/peduli/${guidance.slug}`}
    >
      <article className="flex h-full flex-col rounded-md border border-[#24186f]/12 bg-white p-4 shadow-[0_16px_38px_rgba(16,18,42,0.08)] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[#24186f]/30 group-hover:shadow-[0_22px_48px_rgba(16,18,42,0.13)] sm:p-5">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-md",
            style.surface,
          )}
        >
          <Icon aria-hidden="true" className={cn("h-6 w-6", style.accent)} />
        </div>
        <div className="mt-4 min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-muted">
            {guidance.englishTitle}
          </p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight text-herbal-ink">
            {guidance.title}
          </h3>
          {guidance.ageRange ? (
            <p className="mt-2 text-sm font-semibold text-[#24186f]">
              {guidance.ageRange}
            </p>
          ) : null}
        </div>
        {!compact ? (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-herbal-muted">
            {guidance.characteristics[0]?.paragraphs?.[0] ??
              guidance.characteristics[0]?.items?.[0] ??
              "Panduan PEDULI"}
          </p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[#24186f]">
          Buka panduan
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </article>
    </Link>
  );
}
