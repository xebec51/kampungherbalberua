import type { Program } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getProgramStatusLabel } from "@/lib/formatters";

type ProgramCardProps = {
  program: Program;
};

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm">
      <ImagePlaceholder
        label={`Ilustrasi placeholder program ${program.title}`}
        variant={program.image.includes("map") ? "map" : "activity"}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="green">{program.category}</StatusBadge>
          <StatusBadge tone="neutral">
            {getProgramStatusLabel(program.status)}
          </StatusBadge>
        </div>
        <h3 className="mt-4 text-xl font-bold text-herbal-ink">
          {program.title}
        </h3>
        <p className="mt-4 flex-1 text-sm leading-6 text-herbal-muted">
          {program.description}
        </p>
        <p className="mt-5 text-sm font-semibold text-herbal-brown">
          Progres: {program.progress === null ? "Dalam pendataan" : `${program.progress}%`}
        </p>
      </div>
    </article>
  );
}
