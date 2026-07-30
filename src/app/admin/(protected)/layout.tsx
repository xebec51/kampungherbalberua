import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/login/actions";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { requireStaff } from "@/lib/auth/require-staff";

type AdminProtectedLayoutProps = {
  children: ReactNode;
};

const adminNavigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/herbacode", label: "HerbaCode" },
  { href: "/admin/tanaman", label: "Tanaman" },
  { href: "/admin/zona", label: "Zona Kesehatan" },
  { href: "/admin/media", label: "Media" },
  { href: "/", label: "Lihat Website" },
];

const roleLabels = {
  admin: "Admin",
};

export default async function AdminProtectedLayout({
  children,
}: AdminProtectedLayoutProps) {
  const { profile, user } = await requireStaff("/admin");
  const displayName = profile.display_name?.trim() || user.email || "Staf";

  return (
    <section className="min-h-screen bg-herbal-cream py-6 sm:py-8">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
          <aside className="h-fit rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
            <div>
              <Logo className="mb-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
                Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-bold text-herbal-ink">
                Kampung Herbal Berua
              </h1>
            </div>
            <div className="mt-5 rounded-md border border-herbal-green/10 bg-herbal-soft p-4">
              <p className="text-sm font-semibold text-herbal-ink">{displayName}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-herbal-green">
                {roleLabels[profile.role]}
              </p>
            </div>
            <nav aria-label="Navigasi admin" className="mt-5">
              <ul className="grid gap-2">
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
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </section>
  );
}
