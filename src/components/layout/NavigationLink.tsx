"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type NavigationLinkProps = {
  href: string;
  label: string;
  onClick?: () => void;
  mobile?: boolean;
  nested?: boolean;
  tone?: "default" | "hero" | "solid";
  variant?: "link" | "cta";
};

export function NavigationLink({
  href,
  label,
  onClick,
  mobile = false,
  nested = false,
  tone = "default",
  variant = "link",
}: NavigationLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);
  const isCta = variant === "cta";
  const defaultStyle = active
    ? "bg-herbal-soft !text-herbal-deep"
    : "!text-herbal-ink hover:bg-herbal-soft hover:!text-herbal-green";
  const heroStyle = active
    ? "bg-white/[0.18] !text-white"
    : "!text-white/95 hover:bg-white/[0.12] hover:!text-white";
  const solidStyle = active
    ? "bg-white !text-herbal-deep"
    : "!text-white/90 hover:bg-white/[0.14] hover:!text-white";
  const ctaStyle = active
    ? "bg-herbal-brown !text-white ring-2 ring-white/70"
    : "bg-herbal-brown !text-white shadow-sm hover:bg-[#5f280f]";

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2",
        tone === "default"
          ? "focus-visible:outline-herbal-brown"
          : "focus-visible:outline-white",
        mobile ? "flex min-h-11 items-center px-3 py-2 text-base" : "px-3 py-2 text-sm",
        nested && "pl-7",
        isCta &&
          (mobile
            ? "mt-2 justify-center px-4 font-bold"
            : "min-h-10 px-4 font-bold"),
        isCta
          ? ctaStyle
          : mobile
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
