import Link from "next/link";
import type { ReactNode } from "react";
import { HoverCard } from "@/components/motion/HoverCard";
import { cn } from "@/lib/utils";

type PublicCardProps = {
  children: ReactNode;
  className?: string;
};

type PublicCardBodyProps = {
  children: ReactNode;
  className?: string;
};

type PublicCardActionProps = {
  children: ReactNode;
  href: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function PublicCard({ children, className }: PublicCardProps) {
  return (
    <HoverCard
      as="article"
      className={cn(
        "public-card group/card flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-herbal-green/10 bg-white/96 shadow-[var(--shadow-soft)] ring-1 ring-white/70",
        className,
      )}
    >
      {children}
    </HoverCard>
  );
}

export function PublicCardBody({ children, className }: PublicCardBodyProps) {
  return (
    <div className={cn("flex flex-1 flex-col p-5", className)}>{children}</div>
  );
}

const actionVariants = {
  primary:
    "border-herbal-deep bg-herbal-deep text-white shadow-[0_10px_24px_rgba(7,25,15,0.16)] hover:border-herbal-green hover:bg-herbal-green",
  secondary:
    "border-herbal-green/22 bg-herbal-soft text-herbal-deep hover:border-herbal-green/45 hover:bg-white",
  ghost:
    "border-transparent bg-transparent text-herbal-green hover:border-herbal-green/20 hover:bg-herbal-soft",
};

export function PublicCardAction({
  children,
  href,
  className,
  variant = "primary",
}: PublicCardActionProps) {
  return (
    <Link
      className={cn(
        "mt-5 inline-flex min-h-11 items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown",
        actionVariants[variant],
        className,
      )}
      href={href}
    >
      <span>{children}</span>
      <svg
        aria-hidden="true"
        className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/card:translate-x-0.5"
        fill="none"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 4.5 12.5 10 7 15.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </Link>
  );
}
