import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StreetAdminRecord = Database["public"]["Tables"]["streets"]["Row"];

export type AdminStreetResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

async function getAdminClient() {
  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      client: null,
      error: "Supabase belum dikonfigurasi untuk dashboard admin.",
    };
  }

  return { client, error: null };
}

export async function getAllStreetsForAdmin(): Promise<
  AdminStreetResult<StreetAdminRecord[]>
> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { data, error } = await client
    .from("streets")
    .select("*")
    .order("street_name", { ascending: true });

  if (error) {
    console.error("Gagal memuat daftar jalan admin", { code: error.code });
    return { data: null, error: "Daftar jalan tematik belum dapat dimuat." };
  }

  return { data: data ?? [], error: null };
}

export async function getStreetByIdForAdmin(
  id: string,
): Promise<AdminStreetResult<StreetAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { data, error } = await client
    .from("streets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat detail jalan admin", { code: error.code });
    return { data: null, error: "Data jalan belum dapat dimuat." };
  }

  if (!data) {
    return { data: null, error: "Jalan tematik tidak ditemukan." };
  }

  return { data, error: null };
}
