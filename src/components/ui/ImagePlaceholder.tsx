import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  label: string;
  variant?: "plant" | "recipe" | "product" | "activity" | "map";
  className?: string;
};

const accents = {
  plant: "bg-herbal-soft text-herbal-green",
  recipe: "bg-[#F5E9DF] text-herbal-brown",
  product: "bg-white text-herbal-green",
  activity: "bg-[#EEF1EC] text-herbal-deep",
  map: "bg-[#E8EFE5] text-herbal-deep",
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
        "flex aspect-[4/3] w-full items-center justify-center rounded-md border border-herbal-green/15 p-6 text-center text-sm font-semibold shadow-sm",
        accents[variant],
        className,
      )}
    >
      <span>{label}</span>
    </div>
  );
}
