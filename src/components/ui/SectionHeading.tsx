import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-3xl font-bold tracking-normal text-herbal-ink sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <div className="mt-4 text-base leading-7 text-herbal-muted sm:text-lg">
          {description}
        </div>
      ) : null}
    </div>
  );
}
