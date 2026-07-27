import Link from "next/link";
import type { ReactNode } from "react";
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
};

export function PublicCard({ children, className }: PublicCardProps) {
  return (
    <article
      className={cn(
        "public-card group flex h-full flex-col overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-[0_8px_24px_rgba(17,27,21,0.08)]",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function PublicCardBody({ children, className }: PublicCardBodyProps) {
  return (
    <div className={cn("flex flex-1 flex-col p-4", className)}>{children}</div>
  );
}

export function PublicCardAction({
  children,
  href,
  className,
}: PublicCardActionProps) {
  return (
    <Link
      className={cn(
        "mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green/25 bg-herbal-soft px-4 py-2 text-sm font-bold text-herbal-deep transition hover:border-herbal-green/45 hover:bg-herbal-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown",
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
