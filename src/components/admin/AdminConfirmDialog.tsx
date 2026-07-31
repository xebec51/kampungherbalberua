"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminConfirmDialogProps = {
  children?: ReactNode;
  className?: string;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
};

// Built on the native <dialog> element -- no modal/dialog library exists in
// this codebase yet. Handles open/close syncing (including Escape, which the
// browser closes natively without telling the parent) and backdrop clicks.
export function AdminConfirmDialog({
  children,
  className,
  description,
  onClose,
  open,
  title,
}: AdminConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const node = dialogRef.current;

    if (!node) {
      return;
    }

    if (open && !node.open) {
      node.showModal();
    }

    if (!open && node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={cn(
        "m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[var(--radius-card)] border border-herbal-green/15 bg-white p-0 shadow-[var(--shadow-lift)] backdrop:bg-herbal-ink/45",
        className,
      )}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="grid gap-4 p-5">
        <div>
          <h2 className="text-lg font-bold text-herbal-ink" id={titleId}>
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-herbal-muted" id={descriptionId}>
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </dialog>
  );
}
