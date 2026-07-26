import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";
import { Container } from "@/components/ui/Container";
import { createPageMetadata } from "@/lib/metadata";
import { getSafeAdminRedirect } from "@/lib/auth/safe-redirect";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = createPageMetadata({
  title: "Masuk Admin",
  description: "Halaman masuk staf Kampung Herbal Berua.",
  path: "/admin/login",
});

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const initialMessage =
    params.error === "akses-ditolak"
      ? "Akses ditolak. Masuk menggunakan akun staf yang aktif."
      : undefined;
  const nextPath = getSafeAdminRedirect(params.next, "/admin");

  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container className="max-w-xl">
        <div className="rounded-md border border-herbal-green/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-herbal-ink">
            Masuk Dashboard
          </h1>
          <p className="mt-4 text-sm leading-6 text-herbal-muted">
            Gunakan email dan kata sandi staf yang sudah dibuat di Supabase Auth.
            Registrasi publik tidak tersedia pada website ini.
          </p>
          <LoginForm initialMessage={initialMessage} nextPath={nextPath} />
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-herbal-green hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            href="/"
          >
            Kembali ke website publik
          </Link>
        </div>
      </Container>
    </section>
  );
}
