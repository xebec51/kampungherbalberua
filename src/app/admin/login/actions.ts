"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isStaffRole } from "@/lib/auth/permissions";
import { getSafeAdminRedirect } from "@/lib/auth/safe-redirect";

export type LoginActionState = {
  message: string | null;
};

const invalidLoginMessage = "Email atau kata sandi tidak valid.";

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(
  _state: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = readField(formData, "email").toLowerCase();
  const password = readField(formData, "password");

  if (!email || !password) {
    return { message: invalidLoginMessage };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return { message: "Layanan masuk belum tersedia." };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { message: invalidLoginMessage };
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Gagal memeriksa akses staf", { code: profileError.code });
  }

  if (!profile || !profile.is_active || !isStaffRole(profile.role)) {
    await client.auth.signOut();
    return { message: "Akses ditolak. Hubungi pengelola website." };
  }

  redirect(getSafeAdminRedirect(formData.get("next"), "/admin"));
}

export async function logoutAction() {
  const client = await createSupabaseServerClient();

  if (client) {
    await client.auth.signOut();
  }

  redirect("/admin/login");
}
