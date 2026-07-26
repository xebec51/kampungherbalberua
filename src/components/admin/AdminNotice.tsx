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
      ? "border-herbal-green/20 bg-herbal-soft text-herbal-deep"
      : "border-herbal-brown/20 bg-[#F5E9DF] text-herbal-brown";

  return (
    <p className={`rounded-md border px-4 py-3 text-sm font-medium ${classes}`} role="status">
      {message}
    </p>
  );
}
