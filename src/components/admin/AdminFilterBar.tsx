import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminFilterBarProps = {
  children: ReactNode;
  className?: string;
};

// Plain GET form (no `action`) so filters stay in the URL as query params,
// matching every other admin list page. Layout is compact: fields wrap on
// narrow screens, align to a row on desktop.
export function AdminFilterBar({ children, className }: AdminFilterBarProps) {
  return (
    <form
      className={cn(
        "grid gap-3 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end lg:gap-4",
        className,
      )}
    >
      {children}
    </form>
  );
}
