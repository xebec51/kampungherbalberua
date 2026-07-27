"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavigationLinkProps = {
  href: string;
  label: string;
  onClick?: () => void;
  mobile?: boolean;
  tone?: "default" | "hero" | "solid";
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
  tone = "default",
}: NavigationLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);
  const defaultStyle = active
    ? "bg-herbal-soft !text-herbal-deep"
    : "!text-herbal-ink hover:bg-herbal-soft hover:!text-herbal-green";
  const heroStyle = active
    ? "bg-white/[0.18] !text-white"
    : "!text-white/95 hover:bg-white/[0.12] hover:!text-white";
  const solidStyle = active
    ? "bg-white !text-herbal-deep"
    : "!text-white/90 hover:bg-white/[0.14] hover:!text-white";

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2",
        tone === "default"
          ? "focus-visible:outline-herbal-brown"
          : "focus-visible:outline-white",
        mobile
          ? "block px-3 py-3 text-base"
          : "px-3 py-2 text-sm",
        mobile
          ? defaultStyle
          : tone === "hero"
            ? heroStyle
            : tone === "solid"
              ? solidStyle
              : defaultStyle,
      )}
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}
