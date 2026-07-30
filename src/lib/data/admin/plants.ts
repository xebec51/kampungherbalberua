import type {
  ContentStatus,
  Database,
  PlantCategory,
  ValidationStatus,
} from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/auth/permissions";

export type PlantAdminRecord = Database["public"]["Tables"]["plants"]["Row"];

export type PlantAdminInput = {
  care_instructions: string[];
  category: PlantCategory;
  content_status: ContentStatus;
  description: string;
  featured: boolean;
  image_path: string | null;
  local_name: string;
  location_status: string | null;
  other_names: string[];
  plant_code: string | null;
  preparation: string[];
  scientific_name: string | null;
  short_description: string;
  slug: string;
  source_notes: string | null;
  traditional_uses: string[];
  used_parts: string[];
  validation_status: ValidationStatus;
  validation_checked_at: string | null;
  validation_notes: string | null;
  validator_name: string | null;
  warnings: string[];
};

export type PlantAdminFilters = {
  contentStatus?: ContentStatus | "all";
  query?: string;
  validationStatus?: ValidationStatus | "all";
};

export type AdminMutationResult<T> =
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

export async function getAllPlantsForAdmin(
  filters: PlantAdminFilters = {},
): Promise<AdminMutationResult<PlantAdminRecord[]>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  let query = client.from("plants").select("*").order("updated_at", {
    ascending: false,
  });

  if (filters.query) {
    const escapedQuery = filters.query.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `local_name.ilike.%${escapedQuery}%,slug.ilike.%${escapedQuery}%,scientific_name.ilike.%${escapedQuery}%`,
    );
  }

  if (filters.contentStatus && filters.contentStatus !== "all") {
    query = query.eq("content_status", filters.contentStatus);
  }

  if (filters.validationStatus && filters.validationStatus !== "all") {
    query = query.eq("validation_status", filters.validationStatus);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Gagal memuat daftar tanaman admin", { code: error.code });
    return { data: null, error: "Daftar tanaman belum dapat dimuat." };
  }

  return { data: data ?? [], error: null };
}

export async function getPlantByIdForAdmin(
  id: string,
): Promise<AdminMutationResult<PlantAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { data, error } = await client
    .from("plants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat detail tanaman admin", { code: error.code });
    return { data: null, error: "Data tanaman belum dapat dimuat." };
  }

  if (!data) {
    return { data: null, error: "Tanaman tidak ditemukan." };
  }

  return { data, error: null };
}

export async function createPlant(
  input: PlantAdminInput,
  actorId: string,
): Promise<AdminMutationResult<PlantAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const publishedAt =
    input.content_status === "published" ? new Date().toISOString() : null;

  const payload: Database["public"]["Tables"]["plants"]["Insert"] = {
    ...input,
    created_by: actorId,
    published_at: publishedAt,
    updated_by: actorId,
  };

  const { data, error } = await client
    .from("plants")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Gagal membuat tanaman admin", { code: error.code });
    return {
      data: null,
      error:
        error.code === "23505"
          ? "Slug atau kode tanaman sudah digunakan."
          : "Tanaman belum dapat dibuat.",
    };
  }

  return { data, error: null };
}

export async function updatePlant(
  id: string,
  input: PlantAdminInput,
  actorId: string,
): Promise<AdminMutationResult<PlantAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const publishedAt =
    input.content_status === "published" ? new Date().toISOString() : null;

  const payload: Database["public"]["Tables"]["plants"]["Update"] = {
    ...input,
    published_at: publishedAt,
    updated_by: actorId,
  };

  const { data, error } = await client
    .from("plants")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Gagal memperbarui tanaman admin", { code: error.code });
    return {
      data: null,
      error:
        error.code === "23505"
          ? "Slug atau kode tanaman sudah digunakan."
          : "Tanaman belum dapat diperbarui.",
    };
  }

  return { data, error: null };
}

export async function deletePlant(
  id: string,
  role: StaffRole,
): Promise<AdminMutationResult<{ id: string }>> {
  if (role !== "admin") {
    return { data: null, error: "Hanya admin yang dapat menghapus tanaman." };
  }

  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { error } = await client.from("plants").delete().eq("id", id);

  if (error) {
    console.error("Gagal menghapus tanaman admin", { code: error.code });
    return { data: null, error: "Tanaman belum dapat dihapus." };
  }

  return { data: { id }, error: null };
}
