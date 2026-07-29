"use client";

import { useState } from "react";

type CopyQrUrlButtonProps = {
  url: string;
};

export function CopyQrUrlButton({ url }: CopyQrUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "URL QR tersalin" : "Salin URL QR permanen"}
    </button>
  );
}
