"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
} from "react";
import type { NavigationGroup } from "@/data/navigation";
import { hasActiveChild, isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type NavigationDropdownProps = {
  item: NavigationGroup;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  tone?: "default" | "hero" | "solid";
};

export function NavigationDropdown({
  item,
  onOpenChange,
  open,
  tone = "default",
}: NavigationDropdownProps) {
  const pathname = usePathname();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const focusFirstOnOpenRef = useRef(false);
  const active = hasActiveChild(pathname, item.children);
  const defaultStyle = active
    ? "bg-herbal-soft !text-herbal-deep"
    : "!text-herbal-ink hover:bg-herbal-soft hover:!text-herbal-green";
  const heroStyle = active
    ? "bg-white/[0.18] !text-white"
    : "!text-white/95 hover:bg-white/[0.12] hover:!text-white";
  const solidStyle = active
    ? "bg-white !text-herbal-deep"
    : "!text-white/90 hover:bg-white/[0.14] hover:!text-white";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  useEffect(() => {
    if (open && focusFirstOnOpenRef.current) {
      firstLinkRef.current?.focus();
      focusFirstOnOpenRef.current = false;
    }
  }, [open]);

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusFirstOnOpenRef.current = true;
      onOpenChange(true);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-current={active ? "page" : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex min-h-10 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2",
          tone === "default"
            ? "focus-visible:outline-herbal-brown"
            : "focus-visible:outline-white",
          tone === "hero"
            ? heroStyle
            : tone === "solid"
              ? solidStyle
              : defaultStyle,
        )}
        onClick={() => onOpenChange(!open)}
        onKeyDown={handleButtonKeyDown}
        type="button"
      >
        <span>{item.label}</span>
        <svg
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>

      {open ? (
        <div
          className="navigation-dropdown-menu absolute left-1/2 top-[calc(100%+0.55rem)] z-50 w-60 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md border border-herbal-green/15 bg-white p-2 text-herbal-ink shadow-[0_20px_55px_rgba(17,27,21,0.18)]"
          id={menuId}
          role="menu"
        >
          {item.children.map((child, index) => {
            const childActive = isActivePath(pathname, child.href);

            return (
              <Link
                aria-current={childActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-herbal-soft hover:text-herbal-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown",
                  childActive
                    ? "bg-herbal-soft text-herbal-deep"
                    : "text-herbal-muted",
                )}
                href={child.href}
                key={child.href}
                onClick={() => onOpenChange(false)}
                ref={index === 0 ? firstLinkRef : undefined}
                role="menuitem"
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
