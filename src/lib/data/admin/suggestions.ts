import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SuggestionAdminRecord = Database["public"]["Tables"]["suggestions"]["Row"];

export type AdminSuggestionsResult =
  | { data: SuggestionAdminRecord[]; error: null }
  | { data: null; error: string };

export async function getAllSuggestionsForAdmin(): Promise<AdminSuggestionsResult> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return { data: null, error: "Layanan database belum tersedia." };
  }

  const { data, error } = await client
    .from("suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: "Gagal memuat daftar saran warga." };
  }

  return { data, error: null };
}
