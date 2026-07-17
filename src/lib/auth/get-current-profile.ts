import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export type CurrentProfile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getCurrentProfile(
  userId?: string,
): Promise<CurrentProfile | null> {
  const resolvedUserId = userId ?? (await getCurrentUser())?.id;

  if (!resolvedUserId) {
    return null;
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, display_name, role, is_active, created_at, updated_at")
    .eq("id", resolvedUserId)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat profile pengguna saat ini", { code: error.code });
    return null;
  }

  return data;
}
