import Link from "next/link";
import type { HealthCondition } from "@/types";
import { HealthConditionIcon } from "@/components/health-conditions/HealthConditionIcon";
import { PublicCard, PublicCardBody } from "@/components/ui/PublicCard";

type HealthConditionCardProps = {
  healthCondition: HealthCondition;
};

export function HealthConditionCard({ healthCondition }: HealthConditionCardProps) {
  return (
    <Link
      aria-label={healthCondition.name}
      className="block h-full rounded-[var(--radius-card)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-herbal-brown"
      href={`/penyakit/${healthCondition.slug}`}
    >
      <PublicCard className="transition duration-200 hover:border-herbal-green/25 hover:shadow-[0_18px_40px_rgba(17,27,21,0.12)]">
        <div className="flex h-24 items-center justify-center bg-herbal-soft sm:h-32">
          <HealthConditionIcon
            className="h-9 w-9 text-herbal-green sm:h-12 sm:w-12"
            slug={healthCondition.slug}
          />
        </div>
        <PublicCardBody>
          <h3 className="line-clamp-2 text-sm font-extrabold leading-tight text-herbal-ink transition group-hover/card:text-herbal-green sm:text-lg">
            {healthCondition.name}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
            {healthCondition.shortDescription}
          </p>
          <p className="mt-auto pt-3 text-xs font-bold text-herbal-brown sm:pt-4 sm:text-sm">
            {healthCondition.linkedPlants.length} tanaman terkait
          </p>
        </PublicCardBody>
      </PublicCard>
    </Link>
  );
}
