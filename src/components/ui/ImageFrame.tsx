import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ImageFrameProps = {
  children: ReactNode;
  className?: string;
};

export function ImageFrame({ children, className }: ImageFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-2 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
