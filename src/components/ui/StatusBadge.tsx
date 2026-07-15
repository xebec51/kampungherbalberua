import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: string;
  tone?: "green" | "brown" | "neutral";
  className?: string;
};

const toneClass = {
  green: "border-herbal-green/20 bg-herbal-soft text-herbal-deep",
  brown: "border-herbal-brown/20 bg-[#F5E9DF] text-herbal-brown",
  neutral: "border-herbal-muted/20 bg-white text-herbal-muted",
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
