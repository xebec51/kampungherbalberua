import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils";

export type AdminActionVariant =
  | "archive"
  | "danger"
  | "primary"
  | "secondary"
  | "warning";

const variantClass: Record<AdminActionVariant, string> = {
  archive:
    "border border-herbal-gold/50 bg-white text-herbal-brown hover:bg-herbal-gold/12 focus-visible:outline-herbal-brown",
  danger:
    "bg-herbal-danger text-white hover:bg-[#872a22] focus-visible:outline-herbal-danger",
  primary:
    "bg-herbal-green text-white shadow-sm hover:bg-herbal-deep focus-visible:outline-herbal-brown",
  secondary:
    "border border-herbal-green bg-white text-herbal-green hover:bg-herbal-soft focus-visible:outline-herbal-brown",
  // Distinct from `danger`: reversible "needs attention" actions (e.g. the
  // Tandai Perlu Perbaikan trigger) should not carry the same visual weight
  // as an irreversible delete -- outline red vs. solid red.
  warning:
    "border border-herbal-danger/50 bg-white text-herbal-danger hover:bg-herbal-danger/10 focus-visible:outline-herbal-danger",
};

const baseButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function AdminActionBar({
  align = "start",
  children,
  className,
}: {
  align?: "end" | "start";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        align === "end" && "sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminActionButton({
  className,
  variant = "secondary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: AdminActionVariant }) {
  return (
    <button
      className={cn(baseButtonClass, variantClass[variant], className)}
      {...props}
    />
  );
}

export function AdminActionLink({
  className,
  variant = "secondary",
  ...props
}: LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    variant?: AdminActionVariant;
  }) {
  return (
    <Link className={cn(baseButtonClass, variantClass[variant], className)} {...props} />
  );
}
