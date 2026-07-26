import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  label: string;
  variant?: "plant" | "recipe" | "product" | "activity" | "map";
  className?: string;
};

const accents = {
  plant: "bg-herbal-soft",
  recipe: "bg-[#f2dfd2]",
  product: "bg-white",
  activity: "bg-herbal-mist",
  map: "bg-[#dfe8dd]",
};

export function ImagePlaceholder({
  label,
  variant = "plant",
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      aria-label={label}
      role="img"
      className={cn(
        "relative isolate flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md border border-herbal-green/15 p-6 shadow-sm",
        accents[variant],
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-herbal-deep/20 to-transparent"
      />
      <span
        aria-hidden="true"
        className="absolute left-5 top-5 h-16 w-10 rotate-[-24deg] rounded-[100%_0_100%_0] bg-herbal-green/75"
      />
      <span
        aria-hidden="true"
        className="absolute left-12 top-12 h-20 w-12 rotate-[24deg] rounded-[0_100%_0_100%] bg-herbal-sage"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-6 right-6 h-20 w-20 rounded-md border border-herbal-green/20 bg-white/65 shadow-sm"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-12 right-12 h-12 w-12 rounded-md bg-herbal-clay/85"
      />
    </div>
  );
}
