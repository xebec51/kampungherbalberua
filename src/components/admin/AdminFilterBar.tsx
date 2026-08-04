"use client";

import Link from "next/link";
import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type AdminFilterBarProps = {
  activeCount?: number;
  children: ReactNode;
  className?: string;
  resetHref: string;
  resultSummary: ReactNode;
  title: string;
};

export function AdminFilterBar({
  activeCount = 0,
  children,
  className,
  resetHref,
  resultSummary,
  title,
}: AdminFilterBarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);

  function openDialog() {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    setIsOpen(true);
  }

  function closeDialog() {
    const dialog = dialogRef.current;

    if (dialog?.open) {
      dialog.close();
    }

    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    const formData = new FormData(event.currentTarget);

    for (const [key, value] of formData.entries()) {
      if (typeof value !== "string") continue;

      const normalizedValue = value.trim();

      if (normalizedValue && normalizedValue !== "all") {
        params.set(key, normalizedValue);
      }
    }

    const query = params.toString();
    window.location.assign(query ? `${resetHref}?${query}` : resetHref);
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-admin-rail/12 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-herbal-muted" aria-live="polite">
          {resultSummary}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-herbal-green px-4 py-2 text-sm font-bold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            onClick={openDialog}
            ref={triggerRef}
            type="button"
          >
            Atur filter
            {activeCount > 0 ? (
              <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs text-herbal-green">
                {activeCount}
              </span>
            ) : null}
          </button>
          {activeCount > 0 ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green/20 px-4 py-2 text-sm font-bold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={resetHref}
            >
              Reset filter
            </Link>
          ) : null}
        </div>
      </div>

      <dialog
        aria-labelledby={titleId}
        className="m-0 h-dvh max-h-none w-dvw max-w-none overflow-y-auto bg-transparent p-0 text-herbal-ink backdrop:bg-herbal-deep/45 backdrop:backdrop-blur-sm"
        onCancel={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
        ref={dialogRef}
      >
        <div
          className="flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6"
          onClick={handleBackdropClick}
        >
          <form
            className={cn(
              "w-full max-w-3xl rounded-md bg-white p-5 shadow-[0_22px_70px_rgba(12,62,34,0.24)] sm:p-6",
              className,
            )}
            method="get"
            onSubmit={handleSubmit}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                className="text-lg font-bold leading-tight text-herbal-ink"
                id={titleId}
              >
                {title}
              </h2>
              <button
                aria-label="Tutup filter"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-herbal-green/20 text-xl font-bold leading-none text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                onClick={closeDialog}
                type="button"
              >
                X
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-herbal-green/20 px-4 py-2 text-sm font-bold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                href={resetHref}
              >
                Reset filter
              </Link>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-4 py-2 text-sm font-bold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                type="submit"
              >
                Terapkan
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
