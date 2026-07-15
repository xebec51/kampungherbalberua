"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavigationLinkProps = {
  href: string;
  label: string;
  onClick?: () => void;
  mobile?: boolean;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavigationLink({
  href,
  label,
  onClick,
  mobile = false,
}: NavigationLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown",
        mobile
          ? "block px-3 py-3 text-base"
          : "px-3 py-2 text-sm",
        active
          ? "bg-herbal-soft text-herbal-deep"
          : "text-herbal-muted hover:bg-white hover:text-herbal-green",
      )}
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}
