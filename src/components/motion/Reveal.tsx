"use client";

import { useRef, type ReactNode } from "react";
import { useInView, useReducedMotion, type Variants } from "framer-motion";
import { tagMap, type MotionTagName } from "./motionTag";
import { useHydrated } from "./useHydrated";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay before the reveal animation starts, in seconds. */
  delay?: number;
  /** Tag rendered for the wrapper. Defaults to "div". */
  as?: MotionTagName;
  /** Vertical distance (px) the content slides up from. Defaults to 24. */
  distance?: number;
  /** Animation duration in seconds. Defaults to 0.6. */
  duration?: number;
  /** Fraction of the element that must be visible to trigger. Defaults to 0.2. */
  amount?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Fades and slides content up as it scrolls into view.
 *
 * SSR/no-JS safe: the server-rendered markup (and the very first client
 * render, before hydration completes) always resolves to the "visible"
 * state — there is no inline hidden style baked into the initial HTML.
 * `useHydrated()` only flips to true once React has actually hydrated and
 * is running client-side, and only then does `useInView` start gating the
 * hidden -> visible transition. If JS never loads or hydration never
 * completes, content simply stays visible.
 * Automatically renders instantly (no motion) when the user has
 * `prefers-reduced-motion` enabled.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  distance = 24,
  duration = 0.6,
  amount = 0.2,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(ref, {
    once: true,
    amount,
    margin: "-80px 0px",
  });
  const hydrated = useHydrated();

  const MotionTag = tagMap[as];

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE,
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
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
