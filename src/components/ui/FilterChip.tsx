import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function FilterChip({ children, className, ...props }: FilterChipProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border border-herbal-green/20 bg-herbal-soft px-3 py-1 text-xs font-bold text-herbal-deep transition hover:border-herbal-green/35 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
