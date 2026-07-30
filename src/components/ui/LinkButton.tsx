import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variants = {
  primary:
    "bg-herbal-gold !text-herbal-ink shadow-[0_12px_28px_rgba(7,25,15,0.16)] hover:bg-white focus-visible:outline-herbal-gold",
  secondary:
    "border border-herbal-green/70 bg-white !text-herbal-deep hover:bg-herbal-soft focus-visible:outline-herbal-brown",
  ghost:
    "!text-herbal-deep hover:bg-herbal-soft focus-visible:outline-herbal-brown",
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
