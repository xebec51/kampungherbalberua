"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  HeartPulse,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  QrCode,
  X,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/admin/login/actions";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const adminNavigation: Array<{ href: string; icon: LucideIcon; label: string }> = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/herbacode", icon: QrCode, label: "HerbaCode" },
  { href: "/admin/tanaman", icon: Leaf, label: "Tanaman" },
  { href: "/admin/zona", icon: HeartPulse, label: "Zona Kesehatan" },
  { href: "/admin/media", icon: ImageIcon, label: "Media" },
  { href: "/admin/kotak-saran", icon: Inbox, label: "Kotak Saran" },
  { href: "/", icon: ExternalLink, label: "Lihat Website" },
];

const roleLabels: Record<string, string> = {
  admin: "Admin",
};

type AdminSidebarProps = { displayName: string; role: string };

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ displayName, role }: AdminSidebarProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function openDrawer() {
    dialogRef.current?.showModal();
    setIsOpen(true);
  }

  function closeDrawer() {
    dialogRef.current?.close();
    setIsOpen(false);
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeDrawer();
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] bg-admin-rail p-4 shadow-[var(--shadow-soft)] lg:hidden">
        <Logo className="min-w-0 shrink" compact tone="solid" />
        <button
          aria-controls="admin-nav-drawer"
          aria-expanded={isOpen}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-white/25 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
          onClick={openDrawer}
          type="button"
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
          Menu
        </button>
      </div>

      <aside className="hidden lg:block lg:h-fit">
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-admin-rail shadow-[var(--shadow-soft)]">
          <AdminNavContent
            displayName={displayName}
            pathname={pathname ?? ""}
            role={role}
            showLogo
          />
        </div>
      </aside>

      <dialog
        aria-label="Navigasi admin"
        className="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-herbal-deep/50 backdrop:backdrop-blur-sm lg:hidden"
        id="admin-nav-drawer"
        onCancel={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
        ref={dialogRef}
      >
        <div
          className="flex h-full w-full justify-start"
          onClick={handleBackdropClick}
        >
          <div className="h-full w-[85vw] max-w-xs overflow-y-auto bg-admin-rail p-5 shadow-[var(--shadow-lift)]">
            <div className="flex items-center justify-between gap-3">
              <Logo className="min-w-0 shrink" compact tone="solid" />
              <button
                aria-label="Tutup menu"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/25 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
                onClick={closeDrawer}
                type="button"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5">
              <AdminNavContent
                displayName={displayName}
                onNavigate={closeDrawer}
                pathname={pathname ?? ""}
                role={role}
              />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

type AdminNavContentProps = {
  displayName: string;
  onNavigate?: () => void;
  pathname: string;
  role: string;
  showLogo?: boolean;
};

function AdminNavContent({
  displayName,
  onNavigate,
  pathname,
  role,
  showLogo = false,
}: AdminNavContentProps) {
  return (
    <div className="p-5">
      {showLogo ? <Logo className="mb-5" tone="solid" /> : null}
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
        Dashboard
      </p>
      <h1 className="mt-2 text-xl font-bold text-white">
        Kampung Herbal Berua
      </h1>
      <div className="mt-5 rounded-md border border-white/12 bg-white/8 p-4">
        <p className="text-sm font-semibold text-white">{displayName}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-admin-accent">
          {roleLabels[role] ?? role}
        </p>
      </div>
      <nav aria-label="Navigasi admin" className="mt-5">
        <ul className="grid gap-1">
          {adminNavigation.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent",
                    active
                      ? "bg-admin-rail-active text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                  href={item.href}
                  onClick={onNavigate}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active && "text-admin-accent",
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <form action={logoutAction} className="mt-5">
        <button
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
          type="submit"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          Keluar
        </button>
      </form>
    </div>
  );
}
