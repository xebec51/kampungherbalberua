import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Container } from "@/components/ui/Container";
import { requireStaff } from "@/lib/auth/require-staff";

type AdminProtectedLayoutProps = {
  children: ReactNode;
};

export default async function AdminProtectedLayout({
  children,
}: AdminProtectedLayoutProps) {
  const { profile, user } = await requireStaff("/admin");
  const displayName = profile.display_name?.trim() || user.email || "Staf";

  return (
    <section className="min-h-screen bg-admin-canvas py-6 sm:py-8">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-herbal-green focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        href="#konten-utama"
      >
        Lewati ke konten utama
      </a>
      <Container>
        <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
          <AdminSidebar displayName={displayName} role={profile.role} />
          <main className="min-w-0 focus:outline-none" id="konten-utama" tabIndex={-1}>
            {children}
          </main>
        </div>
      </Container>
    </section>
  );
}
