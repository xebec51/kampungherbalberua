import { AlertTriangle, CheckCircle2 } from "lucide-react";

type AdminNoticeProps = {
  message?: string;
  tone?: "error" | "success";
};

export function AdminNotice({ message, tone = "success" }: AdminNoticeProps) {
  if (!message) {
    return null;
  }

  const classes =
    tone === "success"
      ? "border-herbal-green/20 border-l-4 border-l-herbal-green bg-herbal-soft text-herbal-deep"
      : "border-herbal-brown/20 border-l-4 border-l-herbal-brown bg-[#F5E9DF] text-herbal-brown";
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <p
      className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium ${classes}`}
      role="status"
    >
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}
