"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { tagMap, type MotionTagName } from "./motionTag";
import { useHydrated } from "./useHydrated";

type HoverCardProps = {
  children: ReactNode;
  className?: string;
  /** Tag rendered for the wrapper. Defaults to "div". Use "button"/"a" to wrap interactive elements directly. */
  as?: MotionTagName;
  /** Vertical lift (px) on hover/focus. Defaults to 4 (subtle, matches the site's existing card-hover feel). */
  lift?: number;
  /** Scale on hover/focus. Defaults to 1.012 — barely perceptible, not bouncy. */
  scale?: number;
};

const TRANSITION = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

/**
 * Adds a subtle hover-lift + scale to a card or button. Only handles the
 * motion (transform) part — pair it with the site's existing shadow/border
 * classes (e.g. `shadow-[var(--shadow-soft)]` -> `hover:shadow-[var(--shadow-lift)]`,
 * as `BrandCard`/`.public-card` already do) rather than baking shadow
 * styling in here, so it composes cleanly with existing card components.
 *
 * Responds to both hover and keyboard focus (`whileFocus`), and disables
 * the transform entirely under `prefers-reduced-motion`, leaving only
 * whatever CSS transitions (e.g. shadow/border-color) the wrapped element
 * already defines.
 *
 * SSR/hydration safe: gesture props (and the `tabIndex`/focus handling
 * Framer Motion attaches for them) are only enabled once `useHydrated()`
 * flips to true, so the server-rendered markup and the very first client
 * render are identical — avoids a hydration attribute mismatch.
 *
 * Usage:
 * ```tsx
 * <HoverCard as="article" className="rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
 *   ...card content...
 * </HoverCard>
 * ```
 */
export function HoverCard({
  children,
  className,
  as = "div",
  lift = 4,
  scale = 1.012,
}: HoverCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const MotionTag = tagMap[as];

  const gesturesEnabled = hydrated && !shouldReduceMotion;
  const hoverState = gesturesEnabled ? { y: -lift, scale } : undefined;
  const tapState = gesturesEnabled
    ? { scale: Math.max(scale - 0.02, 0.98) }
    : undefined;

  return (
    <MotionTag
      className={className}
      whileHover={hoverState}
      whileFocus={hoverState}
      whileTap={tapState}
      transition={TRANSITION}
    >
      {children}
    </MotionTag>
  );
}
