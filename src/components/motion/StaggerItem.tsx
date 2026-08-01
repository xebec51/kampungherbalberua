"use client";

import type { ReactNode } from "react";
import { useReducedMotion, type Variants } from "framer-motion";
import { tagMap, type MotionTagName } from "./motionTag";

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  /** Tag rendered for the wrapper. Defaults to "div". */
  as?: MotionTagName;
  /** Vertical distance (px) the item slides up from. Defaults to 16. */
  distance?: number;
  /** Animation duration in seconds. Defaults to 0.5. */
  duration?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A single item inside a `StaggerGroup`. Deliberately has no `initial` /
 * `animate` props of its own — it inherits its hidden/visible state (and
 * the stagger timing) from the nearest parent `StaggerGroup` via Framer
 * Motion's variant propagation. Only defines the `variants` shape and its
 * own transition.
 */
export function StaggerItem({
  children,
  className,
  as = "div",
  distance = 16,
  duration = 0.5,
}: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = tagMap[as];

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : duration,
        ease: EASE,
      },
    },
  };

  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  );
}
