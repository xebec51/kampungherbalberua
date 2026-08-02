import type { Activity } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PublicCard, PublicCardBody } from "@/components/ui/PublicCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

type ActivityCardProps = {
  activity: Activity;
};

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <PublicCard>
      <ImagePlaceholder
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        label={`Gambar kegiatan ${activity.title}`}
        variant={activity.image.includes("map") ? "map" : "activity"}
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <StatusBadge tone="green">{activity.category}</StatusBadge>
          <StatusBadge tone="brown">{activity.dateLabel}</StatusBadge>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-extrabold leading-tight text-herbal-ink sm:mt-4 sm:text-lg">
          {activity.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-4 sm:text-sm sm:leading-6">
          {activity.description}
        </p>
      </PublicCardBody>
    </PublicCard>
  );
}
