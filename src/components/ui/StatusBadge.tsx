import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: string;
  tone?: "green" | "brown" | "neutral";
  className?: string;
};

const toneClass = {
  green: "border-herbal-green/25 bg-herbal-soft text-herbal-deep",
  brown: "border-herbal-brown/25 bg-[#f2dfd2] text-herbal-brown",
  neutral: "border-herbal-muted/25 bg-white text-herbal-ink",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
