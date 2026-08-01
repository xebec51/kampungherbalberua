"use client";

import { useRef, type ReactNode } from "react";
import { useInView, useReducedMotion, type Variants } from "framer-motion";
import { tagMap, type MotionTagName } from "./motionTag";
import { useHydrated } from "./useHydrated";

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  /** Tag rendered for the wrapper. Defaults to "div". */
  as?: MotionTagName;
  /** Seconds between each child's animation start. Defaults to 0.08. */
  staggerDelay?: number;
  /** Seconds to wait before the first child starts. Defaults to 0. */
  delayChildren?: number;
  /** Fraction of the group that must be visible to trigger. Defaults to 0.15. */
  amount?: number;
};

/**
 * Wraps a grid/list of cards so its `StaggerItem` children reveal one after
 * another as the group scrolls into view, instead of all at once.
 *
 * SSR/no-JS safe: same hydration-gated `useInView` approach as `Reveal` —
 * the server-rendered markup (and children, via variant propagation)
 * resolve to "visible" until `useHydrated()` confirms the component has
 * actually hydrated on the client. If JS never loads, the group and all
 * its `StaggerItem` children stay visible. Respects `prefers-reduced-motion`
 * by collapsing the stagger gap and child transitions to near-zero.
 *
 * Usage:
 * ```tsx
 * <StaggerGroup className="grid grid-cols-3 gap-4">
 *   {items.map((item) => (
 *     <StaggerItem key={item.id}>
 *       <PublicCard ... />
 *     </StaggerItem>
 *   ))}
 * </StaggerGroup>
 * ```
 */
export function StaggerGroup({
  children,
  className,
  as = "div",
  staggerDelay = 0.08,
  delayChildren = 0,
  amount = 0.15,
}: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(ref, {
    once: true,
    amount,
    margin: "-80px 0px",
  });
  const hydrated = useHydrated();

  const MotionTag = tagMap[as];

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: shouldReduceMotion ? 0 : delayChildren,
      },
    },
  };

  const animateState =
    !hydrated || isInView || shouldReduceMotion ? "visible" : "hidden";

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={false}
      animate={animateState}
      variants={container}
    >
      {children}
    </MotionTag>
  );
}
