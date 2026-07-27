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
        label={`Ilustrasi placeholder kegiatan ${activity.title}`}
        variant={activity.image.includes("map") ? "map" : "activity"}
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="green">{activity.category}</StatusBadge>
          <StatusBadge tone="brown">{activity.dateLabel}</StatusBadge>
        </div>
        <h3 className="mt-4 text-lg font-bold leading-tight text-herbal-ink">
          {activity.title}
        </h3>
        <p className="mt-3 line-clamp-4 flex-1 text-sm leading-6 text-herbal-muted">
          {activity.description}
        </p>
      </PublicCardBody>
    </PublicCard>
  );
}
