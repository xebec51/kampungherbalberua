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
  title: string;
};

// The trigger is always a compact icon button (text label only at < lg,
// where it has its own full-width row anyway) so it never competes with a
// page title sharing the same row at lg:+ -- see CatalogPageHeader.tsx. The
// result-count text and quick Reset link live with the active-filter chips
// in the calling catalog component instead of growing this button into a
// box, which is what used to squeeze the title into wrapping once a filter
// was applied.
export function FilterDialog({
  activeCount,
  children,
  onReset,
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

  const hasActiveFilters = activeCount > 0;

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={hasActiveFilters ? `Atur filter, ${activeCount} aktif` : "Atur filter"}
        className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-herbal-green px-4 text-sm font-bold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown lg:h-11 lg:w-11 lg:px-0"
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        <FilterIcon />
        <span aria-hidden="true" className="lg:hidden">
          Atur filter
        </span>
        {hasActiveFilters ? (
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-herbal-gold px-1 text-[0.65rem] font-bold text-herbal-ink"
          >
            {activeCount}
          </span>
        ) : null}
      </button>

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
    </>
  );
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 5h14M6.5 10h7M9.5 15h1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
