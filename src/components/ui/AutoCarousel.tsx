"use client";

import {
  Children,
  type CSSProperties,
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
  edgeTone?: "cream" | "white";
  intervalMs?: number;
  itemClassName?: string;
};

const edgeTones = {
  cream: {
    left: "from-herbal-cream via-herbal-cream/85",
    right: "from-herbal-cream via-herbal-cream/85",
  },
  white: {
    left: "from-white via-white/85",
    right: "from-white via-white/85",
  },
};

export function AutoCarousel({
  ariaLabel,
  children,
  className,
  edgeTone = "cream",
  intervalMs = 4500,
  itemClassName,
}: AutoCarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const trackRef = useRef<HTMLDivElement>(null);
  const glideTimeoutRef = useRef<number | null>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [isGliding, setIsGliding] = useState(false);
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

    setIsGliding(true);

    if (glideTimeoutRef.current) {
      window.clearTimeout(glideTimeoutRef.current);
    }

    glideTimeoutRef.current = window.setTimeout(() => {
      setIsGliding(false);
    }, 700);

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
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const updateCanScroll = () => {
      setCanScroll(track.scrollWidth > track.clientWidth + 1);
    };

    updateCanScroll();

    const resizeObserver = new ResizeObserver(updateCanScroll);
    resizeObserver.observe(track);

    window.addEventListener("resize", updateCanScroll);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCanScroll);
    };
  }, [items.length]);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || items.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      scrollByItem(1);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [intervalMs, isPaused, items.length, prefersReducedMotion, scrollByItem]);

  useEffect(() => {
    return () => {
      if (glideTimeoutRef.current) {
        window.clearTimeout(glideTimeoutRef.current);
      }
    };
  }, []);

  const edgeClasses = edgeTones[edgeTone];

  return (
    <div
      className={cn("relative", className)}
      onBlurCapture={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        aria-label={ariaLabel}
        className="carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-gliding={isGliding}
        ref={trackRef}
        role="region"
      >
        {items.map((item, index) => (
          <div
            className={cn(
              "carousel-card min-w-0 shrink-0 snap-start",
              itemClassName ??
                "basis-[82%] sm:basis-[46%] lg:basis-[31%] xl:basis-[24%]",
            )}
            data-carousel-item
            key={index}
            style={{ "--carousel-index": index } as CSSProperties}
          >
            {item}
          </div>
        ))}
      </div>

      {canScroll ? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-2 left-0 z-10 w-12 bg-gradient-to-r to-transparent sm:w-20",
              edgeClasses.left,
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-2 right-0 z-10 w-12 bg-gradient-to-l to-transparent sm:w-20",
              edgeClasses.right,
            )}
          />
        </>
      ) : null}

      <div
        aria-hidden={!canScroll}
        className={cn(
          "pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-1 sm:px-2",
          !canScroll && "hidden",
        )}
      >
        <button
          aria-label="Geser kartu ke kiri"
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-2xl font-bold leading-none text-herbal-deep shadow-[0_14px_34px_rgba(17,27,21,0.18)] backdrop-blur transition hover:-translate-x-0.5 hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown sm:h-11 sm:w-11"
          onClick={() => scrollByItem(-1)}
          type="button"
        >
          <span aria-hidden="true">{"‹"}</span>
        </button>
        <button
          aria-label="Geser kartu ke kanan"
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-herbal-green/20 bg-herbal-green/95 text-2xl font-bold leading-none text-white shadow-[0_14px_34px_rgba(17,27,21,0.22)] backdrop-blur transition hover:translate-x-0.5 hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown sm:h-11 sm:w-11"
          onClick={() => scrollByItem(1)}
          type="button"
        >
          <span aria-hidden="true">{"›"}</span>
        </button>
      </div>
    </div>
  );
}
