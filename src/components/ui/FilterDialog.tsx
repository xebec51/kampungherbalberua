"use client";

import {
  useId,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";

type FilterDialogProps = {
  activeCount: number;
  children: ReactNode;
  onReset: () => void;
  resultSummary: ReactNode;
  title: string;
};

export function FilterDialog({
  activeCount,
  children,
  onReset,
  resultSummary,
  title,
}: FilterDialogProps) {
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

  function handleReset() {
    onReset();
    closeDialog();
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-herbal-muted" aria-live="polite">
          {resultSummary}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-4 py-2 text-sm font-bold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
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
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-herbal-green/20 px-4 py-2 text-sm font-bold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              onClick={onReset}
              type="button"
            >
              Reset filter
            </button>
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
          <div className="w-full max-w-2xl rounded-md bg-white p-5 shadow-[0_22px_70px_rgba(12,62,34,0.24)] sm:p-6">
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
            <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-herbal-green/20 px-4 py-2 text-sm font-bold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                onClick={handleReset}
                type="button"
              >
                Reset filter
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-4 py-2 text-sm font-bold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                onClick={closeDialog}
                type="button"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
