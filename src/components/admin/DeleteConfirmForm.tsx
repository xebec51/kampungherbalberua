"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AdminActionButton } from "@/components/admin/AdminActionBar";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

type DeleteConfirmFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  entityId: string;
  entityLabel: string;
};

// Replaces the old <details>+checkbox inline delete pattern with the shared
// confirm dialog. Deletion is permanent (unlike Arsipkan), so this always
// stays a distinct, more guarded flow.
export function DeleteConfirmForm({
  action,
  entityId,
  entityLabel,
}: DeleteConfirmFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdminActionButton onClick={() => setOpen(true)} type="button" variant="danger">
        Hapus Permanen
      </AdminActionButton>
      <AdminConfirmDialog
        description={`${entityLabel} akan dihapus permanen dan tidak dapat dipulihkan. Gunakan Arsipkan bila data masih mungkin diperlukan di kemudian hari.`}
        onClose={() => setOpen(false)}
        open={open}
        title="Hapus permanen?"
      >
        <form action={action} className="grid gap-4">
          <input name="id" type="hidden" value={entityId} />
          <label className="flex items-start gap-3 text-sm font-semibold text-herbal-ink">
            <input
              className="mt-1 h-4 w-4 accent-herbal-danger"
              name="confirm_delete"
              required
              type="checkbox"
              value="permanen"
            />
            Saya memahami penghapusan ini permanen.
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <AdminActionButton
              formNoValidate
              onClick={() => setOpen(false)}
              type="button"
              variant="secondary"
            >
              Batal
            </AdminActionButton>
            <SubmitDeleteButton />
          </div>
        </form>
      </AdminConfirmDialog>
    </>
  );
}

function SubmitDeleteButton() {
  const { pending } = useFormStatus();

  return (
    <AdminActionButton disabled={pending} type="submit" variant="danger">
      {pending ? "Menghapus..." : "Ya, hapus permanen"}
    </AdminActionButton>
  );
}
