import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BrandButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type BrandButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: BrandButtonVariant;
};

const variants = {
  primary:
    "border-herbal-gold bg-herbal-gold text-herbal-ink shadow-[0_14px_30px_rgba(17,27,21,0.16)] hover:bg-white",
  secondary:
    "border-herbal-green/24 bg-white text-herbal-green hover:bg-herbal-soft",
  ghost:
    "border-transparent bg-transparent text-herbal-green hover:bg-herbal-soft",
  danger: "border-red-700 bg-red-700 text-white hover:bg-red-800",
};

export function BrandButton({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}: BrandButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
