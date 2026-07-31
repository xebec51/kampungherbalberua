import Link from "next/link";
import { logoutAction } from "@/app/admin/login/actions";
import { Logo } from "@/components/layout/Logo";

const adminNavigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/herbacode", label: "HerbaCode" },
  { href: "/admin/tanaman", label: "Tanaman" },
  { href: "/admin/zona", label: "Zona Kesehatan" },
  { href: "/admin/media", label: "Media" },
  { href: "/", label: "Lihat Website" },
];

const roleLabels: Record<string, string> = {
  admin: "Admin",
};

type AdminSidebarProps = {
  displayName: string;
  role: string;
};

// Desktop: sticky sidebar, always visible. Mobile: collapsed behind a "Menu"
// disclosure using the checkbox-hack (peer-checked) so no client JS is
// needed just to open/close the nav.
export function AdminSidebar({ displayName, role }: AdminSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-herbal-green/10 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3 p-4 lg:hidden">
          <Logo />
          <label
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-herbal-green/25 px-3 py-2 text-sm font-semibold text-herbal-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            htmlFor="admin-nav-toggle"
          >
            Menu
          </label>
        </div>
        <input className="peer hidden" id="admin-nav-toggle" type="checkbox" />
        <div className="hidden border-t border-herbal-green/10 p-5 peer-checked:block lg:block lg:border-t-0">
          <Logo className="mb-5 hidden lg:block" />
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-herbal-ink">
            Kampung Herbal Berua
          </h1>
          <div className="mt-5 rounded-md border border-herbal-green/10 bg-herbal-soft p-4">
            <p className="text-sm font-semibold text-herbal-ink">{displayName}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-herbal-green">
              {roleLabels[role] ?? role}
            </p>
          </div>
          <nav aria-label="Navigasi admin" className="mt-5">
            <ul className="grid gap-1">
              {adminNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    className="flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-herbal-muted transition hover:bg-herbal-soft hover:text-herbal-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <form action={logoutAction} className="mt-5">
            <button
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              type="submit"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
