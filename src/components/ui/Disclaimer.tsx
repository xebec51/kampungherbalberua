import type { ReactNode } from "react";

type DisclaimerProps = {
  children: ReactNode;
};

export function Disclaimer({ children }: DisclaimerProps) {
  return (
    <aside className="rounded-md border border-herbal-brown/20 bg-white p-4 text-sm leading-6 text-herbal-muted shadow-sm">
      <strong className="block text-herbal-ink">Catatan kesehatan</strong>
      <div className="mt-1">{children}</div>
    </aside>
  );
}
