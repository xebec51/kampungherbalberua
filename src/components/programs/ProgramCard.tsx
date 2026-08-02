import type { Program } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PublicCard, PublicCardBody } from "@/components/ui/PublicCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getProgramStatusLabel } from "@/lib/formatters";

type ProgramCardProps = {
  program: Program;
};

export function ProgramCard({ program }: ProgramCardProps) {
  const progress = program.progress ?? 0;
  const hasProgress = program.progress !== null && program.progress !== undefined;

  return (
    <PublicCard>
      <ImagePlaceholder
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        label={`Gambar program ${program.title}`}
        variant={program.image.includes("map") ? "map" : "activity"}
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="green">{program.category}</StatusBadge>
          <StatusBadge tone="neutral">
            {getProgramStatusLabel(program.status)}
          </StatusBadge>
        </div>
        <h3 className="mt-4 line-clamp-2 text-lg font-extrabold leading-tight text-herbal-ink">
          {program.title}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-herbal-muted">
          {program.description}
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-herbal-muted">
            <span>Progres</span>
            <span>{hasProgress ? `${program.progress}%` : "Pendataan"}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-herbal-soft shadow-inner">
            <span
              aria-hidden="true"
              className="block h-full rounded-full bg-gradient-to-r from-herbal-green to-herbal-clay"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </PublicCardBody>
    </PublicCard>
  );
}
