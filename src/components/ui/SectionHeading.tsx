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
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-herbal-brown sm:text-sm">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-normal text-herbal-ink sm:text-3xl lg:text-[2.15rem]">
        {title}
      </h2>
      {description ? (
        <div className="mt-4 text-base leading-7 text-herbal-muted">
          {description}
        </div>
      ) : null}
    </div>
  );
}
