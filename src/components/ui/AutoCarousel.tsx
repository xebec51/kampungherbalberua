"use client";

import {
  Children,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type AutoCarouselProps = {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  intervalMs?: number;
  itemClassName?: string;
};

export function AutoCarousel({
  ariaLabel,
  children,
  className,
  intervalMs = 4500,
  itemClassName,
}: AutoCarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const scrollByItem = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    const firstItem = track?.querySelector<HTMLElement>("[data-carousel-item]");

    if (!track || !firstItem) {
      return;
    }

    const styles = window.getComputedStyle(track);
    const gap =
      Number.parseFloat(styles.columnGap || styles.gap || "0") || 16;
    const step = (firstItem.getBoundingClientRect().width + gap) * direction;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;

    if (maxScrollLeft <= 0) {
      return;
    }

    let nextLeft = track.scrollLeft + step;

    if (direction > 0 && nextLeft >= maxScrollLeft - 2) {
      nextLeft = 0;
    }

    if (direction < 0 && nextLeft <= 0) {
      nextLeft = maxScrollLeft;
    }

    track.scrollTo({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      left: Math.max(0, Math.min(nextLeft, maxScrollLeft)),
    });
  }, [prefersReducedMotion]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || items.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      scrollByItem(1);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [intervalMs, isPaused, items.length, prefersReducedMotion, scrollByItem]);

  return (
    <div
      className={cn("relative", className)}
      onFocusCapture={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        aria-label={ariaLabel}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={trackRef}
        role="region"
      >
        {items.map((item, index) => (
          <div
            className={cn(
              "min-w-0 shrink-0 snap-start",
              itemClassName ??
                "basis-[82%] sm:basis-[46%] lg:basis-[31%] xl:basis-[24%]",
            )}
            data-carousel-item
            key={index}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          aria-label="Geser kartu ke kiri"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-herbal-green/25 bg-white text-lg font-bold text-herbal-deep shadow-sm transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          onClick={() => scrollByItem(-1)}
          type="button"
        >
          {"<"}
        </button>
        <button
          aria-label="Geser kartu ke kanan"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-herbal-green text-lg font-bold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          onClick={() => scrollByItem(1)}
          type="button"
        >
          {">"}
        </button>
      </div>
    </div>
  );
}
