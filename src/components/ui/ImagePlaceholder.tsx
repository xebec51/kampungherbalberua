import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  label: string;
  variant?: "plant" | "recipe" | "product" | "activity" | "map";
  className?: string;
};

const accents = {
  plant: "bg-gradient-to-br from-herbal-soft via-white to-[#dfe8dd]",
  recipe: "bg-gradient-to-br from-[#f2dfd2] via-white to-herbal-soft",
  product: "bg-gradient-to-br from-white via-herbal-soft to-[#e8efe6]",
  activity: "bg-gradient-to-br from-herbal-mist via-white to-herbal-soft",
  map: "bg-gradient-to-br from-[#dfe8dd] via-white to-herbal-soft",
};

function visiblePlaceholderLabel(label: string) {
  return label
    .replace(/^Ilustrasi placeholder /, "")
    .replace(/^Gambar sementara /, "");
}

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
        "relative isolate flex aspect-[4/3] w-full items-end overflow-hidden rounded-md border border-herbal-green/15 p-5 text-left shadow-sm",
        accents[variant],
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-herbal-deep/25 to-transparent"
      />
      <span
        aria-hidden="true"
        className="absolute left-6 top-6 h-16 w-10 rotate-[-24deg] rounded-[100%_0_100%_0] bg-herbal-green/75"
      />
      <span
        aria-hidden="true"
        className="absolute left-12 top-12 h-20 w-12 rotate-[24deg] rounded-[0_100%_0_100%] bg-herbal-sage"
      />
      <span
        aria-hidden="true"
        className="absolute right-6 top-1/2 h-20 w-20 -translate-y-1/2 rounded-md border border-herbal-green/20 bg-white/70 shadow-sm"
      />
      <span
        aria-hidden="true"
        className="absolute right-12 top-1/2 h-12 w-12 -translate-y-1/2 rounded-md bg-herbal-clay/85"
      />
      <span className="relative z-10 block max-w-[16rem] rounded-md border border-white/70 bg-white/90 px-4 py-3 text-sm font-bold leading-5 text-herbal-deep shadow-sm">
        {visiblePlaceholderLabel(label)}
        <span className="mt-1 block text-xs font-semibold text-herbal-muted">
          Gambar sedang disiapkan
        </span>
      </span>
    </div>
  );
}
