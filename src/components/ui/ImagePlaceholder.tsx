import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  label: string;
  variant?: "plant" | "recipe" | "product" | "activity" | "map";
  className?: string;
};

const accents = {
  plant: "from-[#f0f6ee] via-white to-[#d9e7d8]",
  recipe: "from-[#fbefe6] via-white to-[#e8f1e5]",
  product: "from-white via-[#edf5ec] to-[#dce8d8]",
  activity: "from-[#eef5ef] via-white to-[#e8efe6]",
  map: "from-[#e1eadf] via-white to-[#f3efe2]",
};

export function ImagePlaceholder({
  label,
  variant = "plant",
  className,
}: ImagePlaceholderProps) {
  const accessibleLabel =
    label
      .replace(/gambar sementara|ilustrasi placeholder|placeholder|sementara/gi, "")
      .replace(/\s+/g, " ")
      .trim() || "Media pendamping";

  return (
    <div
      aria-label={accessibleLabel}
      role="img"
      className={cn(
        "public-card-media image-placeholder relative isolate flex aspect-[4/3] w-full items-end overflow-hidden rounded-md border border-herbal-green/12 bg-gradient-to-br p-4 text-left shadow-sm",
        accents[variant],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-herbal-deep/18 to-transparent"
      />
      <span
        aria-hidden="true"
        className="absolute left-[16%] top-[17%] h-20 w-12 rotate-[-28deg] rounded-[100%_0_100%_0] bg-herbal-green/80 shadow-[0_18px_34px_rgba(39,100,58,0.18)]"
      />
      <span
        aria-hidden="true"
        className="absolute left-[25%] top-[30%] h-24 w-14 rotate-[24deg] rounded-[0_100%_0_100%] bg-herbal-sage/90"
      />
      <span
        aria-hidden="true"
        className="absolute left-[26%] top-[43%] h-[31%] w-2 -translate-x-1/2 rounded-full bg-herbal-green shadow-[0_8px_18px_rgba(39,100,58,0.18)]"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-7 right-7 h-16 w-20 rounded-md border border-herbal-green/12 bg-white/68 shadow-[0_12px_30px_rgba(17,27,21,0.12)] backdrop-blur"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-12 right-12 h-9 w-12 rounded-md bg-herbal-clay/88"
      />
    </div>
  );
}
