import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "green" | "brown" | "neutral";
  className?: string;
};

const toneClass = {
  green: "border-herbal-green/18 bg-herbal-soft text-herbal-deep",
  brown: "border-herbal-brown/18 bg-[#f7e9dc] text-herbal-brown",
  neutral: "border-herbal-muted/16 bg-white/88 text-herbal-ink",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[0.72rem] font-bold leading-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
