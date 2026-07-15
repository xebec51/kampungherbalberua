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
    "bg-herbal-green text-white shadow-sm hover:bg-herbal-deep focus-visible:outline-herbal-brown",
  secondary:
    "border border-herbal-green bg-white text-herbal-green hover:bg-herbal-soft focus-visible:outline-herbal-brown",
  ghost:
    "text-herbal-green hover:bg-herbal-soft focus-visible:outline-herbal-brown",
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
        "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
