import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type {
  AdminStatusTone,
  WorkflowState,
} from "@/lib/workflow/status-labels";
import type { ContentStatus, ValidationStatus } from "@/lib/supabase/database.types";
import { getWorkflowState } from "@/lib/workflow/status-labels";

const toneClass: Record<AdminStatusTone, string> = {
  archived: "border-herbal-muted/25 bg-herbal-muted/10 text-herbal-muted",
  danger: "border-herbal-danger/30 bg-herbal-danger/10 text-herbal-danger",
  neutral: "border-herbal-muted/16 bg-white text-herbal-muted",
  published: "border-herbal-green/20 bg-herbal-soft text-herbal-deep",
  review: "border-herbal-gold/40 bg-herbal-gold/12 text-herbal-brown",
  verified: "border-herbal-sage/40 bg-herbal-sage/15 text-herbal-deep",
};

type AdminStatusBadgeProps = {
  className?: string;
};

// Renders exactly one badge for the derived workflow state (draft / pending
// review / verified / published / rejected / archived) instead of separate
// content-status and validation-status badges, matching the "not too long"
// HerbaCode card requirement.
export function AdminStatusBadge({
  className,
  contentStatus,
  validationStatus,
}: AdminStatusBadgeProps & {
  contentStatus: ContentStatus;
  validationStatus: ValidationStatus;
}) {
  return (
    <AdminStatusBadgeFromState
      className={className}
      state={getWorkflowState(contentStatus, validationStatus)}
    />
  );
}

export function AdminStatusBadgeFromState({
  className,
  state,
}: AdminStatusBadgeProps & { state: WorkflowState }) {
  return <AdminToneBadge className={className} tone={state.tone}>{state.label}</AdminToneBadge>;
}

export function AdminToneBadge({
  children,
  className,
  tone,
}: AdminStatusBadgeProps & { children: ReactNode; tone: AdminStatusTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-bold leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
