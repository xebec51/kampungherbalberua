"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  AdminActionButton,
  type AdminActionVariant,
} from "@/components/admin/AdminActionBar";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

const MIN_REASON_LENGTH = 3;

type WorkflowActionValue = "archive" | "publish" | "reject";

type WorkflowActionMenuProps = {
  action: (formData: FormData) => void | Promise<void>;
  entityId: string;
  entityLabel: string;
};

// The three consolidated workflow actions (replacing the old four Publish /
// Archive / Validasi / Tolak buttons): publish is a single click, reject
// requires a reason via a confirm dialog, archive requires confirmation.
//
// All three funnel into one hidden `workflow_action` field and submit via
// form.requestSubmit() -- rather than three <button type="submit" name=...>
// with different values -- because relying on "which submit button was
// clicked" to pick the field value proved unreliable with a React 19 form
// action spanning multiple same-named submit buttons. Driving the hidden
// input directly and toggling form.noValidate per action is deterministic:
// reject is the only path that needs the required-reason browser validation,
// so it is the only call that turns validation back on.
export function WorkflowActionMenu({
  action,
  entityId,
  entityLabel,
}: WorkflowActionMenuProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const actionInputRef = useRef<HTMLInputElement>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const reasonFieldId = useId();

  function submit(value: WorkflowActionValue, options?: { validate?: boolean }) {
    const form = formRef.current;
    const actionInput = actionInputRef.current;

    if (!form || !actionInput) {
      return;
    }

    actionInput.value = value;
    form.noValidate = !options?.validate;
    form.requestSubmit();
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2" ref={formRef}>
      <input name="id" type="hidden" value={entityId} />
      <input name="workflow_action" ref={actionInputRef} type="hidden" />

      <TriggerButtons
        onArchive={() => setArchiveOpen(true)}
        onPublish={() => submit("publish")}
        onReject={() => setRejectOpen(true)}
      />

      <AdminConfirmDialog
        description={`Berikan alasan perbaikan untuk ${entityLabel}. Status akan berubah menjadi draf dan perlu perbaikan sampai diperbaiki dan divalidasi ulang.`}
        onClose={() => setRejectOpen(false)}
        open={rejectOpen}
        title="Tandai perlu perbaikan"
      >
        <label className="grid gap-2 text-sm font-semibold text-herbal-ink" htmlFor={reasonFieldId}>
          Alasan perlu perbaikan
          <textarea
            className="min-h-24 w-full rounded-md border border-herbal-green/20 bg-white px-3 py-2 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
            id={reasonFieldId}
            minLength={MIN_REASON_LENGTH}
            name="reason"
            required
          />
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <AdminActionButton
            onClick={() => setRejectOpen(false)}
            type="button"
            variant="secondary"
          >
            Batal
          </AdminActionButton>
          <ConfirmButton
            onClick={() => submit("reject", { validate: true })}
            variant="danger"
          >
            Kirim &amp; Tandai
          </ConfirmButton>
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        description={`${entityLabel} akan diarsipkan dan tidak lagi tampil di halaman publik. Data tidak dihapus dan dapat dipulihkan admin kapan saja.`}
        onClose={() => setArchiveOpen(false)}
        open={archiveOpen}
        title="Arsipkan konten ini?"
      >
        <div className="flex flex-wrap justify-end gap-2">
          <AdminActionButton
            onClick={() => setArchiveOpen(false)}
            type="button"
            variant="secondary"
          >
            Batal
          </AdminActionButton>
          <ConfirmButton onClick={() => submit("archive")} variant="archive">
            Ya, arsipkan
          </ConfirmButton>
        </div>
      </AdminConfirmDialog>
    </form>
  );
}

function TriggerButtons({
  onArchive,
  onPublish,
  onReject,
}: {
  onArchive: () => void;
  onPublish: () => void;
  onReject: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <AdminActionButton
        disabled={pending}
        onClick={onPublish}
        type="button"
        variant="primary"
      >
        {pending ? "Memproses..." : "Validasi & Publikasikan"}
      </AdminActionButton>
      <AdminActionButton
        disabled={pending}
        onClick={onReject}
        type="button"
        variant="warning"
      >
        Tandai Perlu Perbaikan
      </AdminActionButton>
      <AdminActionButton
        disabled={pending}
        onClick={onArchive}
        type="button"
        variant="archive"
      >
        Arsipkan
      </AdminActionButton>
    </>
  );
}

function ConfirmButton({
  children,
  onClick,
  variant,
}: {
  children: ReactNode;
  onClick: () => void;
  variant: AdminActionVariant;
}) {
  const { pending } = useFormStatus();

  return (
    <AdminActionButton
      disabled={pending}
      onClick={onClick}
      type="button"
      variant={variant}
    >
      {pending ? "Memproses..." : children}
    </AdminActionButton>
  );
}
