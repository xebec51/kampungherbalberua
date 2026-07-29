import type {
  ContentStatus,
  Database,
  ValidationStatus,
} from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/auth/permissions";

export type HealthZoneAdminRecord =
  Database["public"]["Tables"]["health_zones"]["Row"];

export type HealthZoneAdminInput = {
  block_ranges: string[];
  content_status: ContentStatus;
  educational_points: string[];
  featured: boolean;
  health_topic: string;
  healthy_habits: string[];
  image_path: string | null;
  important_notes: string[];
  location_notes: string | null;
  overview: string;
  program_name: string;
  short_description: string;
  sign_text: string | null;
  slug: string;
  source_notes: string[];
  street_name: string | null;
  validation_status: ValidationStatus;
  validator_name: string | null;
  zone_code: string;
  zone_name: string;
};

export type HealthZoneAdminFilters = {
  contentStatus?: ContentStatus | "all";
  query?: string;
  validationStatus?: ValidationStatus | "all";
};

export type AdminHealthZoneResult<T> =
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

export async function getAllHealthZonesForAdmin(
  filters: HealthZoneAdminFilters = {},
): Promise<AdminHealthZoneResult<HealthZoneAdminRecord[]>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  let query = client.from("health_zones").select("*").order("zone_code", {
    ascending: true,
  });

  if (filters.query) {
    const escapedQuery = filters.query.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `street_name.ilike.%${escapedQuery}%,zone_name.ilike.%${escapedQuery}%,zone_code.ilike.%${escapedQuery}%,slug.ilike.%${escapedQuery}%`,
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
    console.error("Gagal memuat daftar zona admin", { code: error.code });
    return { data: null, error: "Daftar zona kesehatan belum dapat dimuat." };
  }

  return { data: data ?? [], error: null };
}

export async function getHealthZoneByIdForAdmin(
  id: string,
): Promise<AdminHealthZoneResult<HealthZoneAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { data, error } = await client
    .from("health_zones")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat detail zona admin", { code: error.code });
    return { data: null, error: "Data zona belum dapat dimuat." };
  }

  if (!data) {
    return { data: null, error: "Zona kesehatan tidak ditemukan." };
  }

  return { data, error: null };
}

export async function getHealthZoneAdminStats() {
  const result = await getAllHealthZonesForAdmin();

  if (result.error || !result.data) {
    return {
      data: null,
      error: result.error ?? "Statistik zona belum dapat dimuat.",
    };
  }

  const zones = result.data;

  return {
    data: {
      draft: zones.filter((zone) => zone.content_status === "draft").length,
      published: zones.filter((zone) => zone.content_status === "published").length,
      total: zones.length,
    },
    error: null,
  };
}

export async function createHealthZone(
  input: HealthZoneAdminInput,
  actorId: string,
): Promise<AdminHealthZoneResult<HealthZoneAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const payload: Database["public"]["Tables"]["health_zones"]["Insert"] = {
    ...input,
    created_by: actorId,
    published_at:
      input.content_status === "published" ? new Date().toISOString() : null,
    updated_by: actorId,
  };

  const { data, error } = await client
    .from("health_zones")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Gagal membuat zona admin", { code: error.code });
    return {
      data: null,
      error:
        error.code === "23505"
          ? "Slug atau kode zona sudah digunakan."
          : "Zona kesehatan belum dapat dibuat.",
    };
  }

  return { data, error: null };
}

export async function updateHealthZone(
  id: string,
  input: HealthZoneAdminInput,
  actorId: string,
  existingPublishedAt: string | null,
): Promise<AdminHealthZoneResult<HealthZoneAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const payload: Database["public"]["Tables"]["health_zones"]["Update"] = {
    ...input,
    published_at:
      existingPublishedAt ??
      (input.content_status === "published" ? new Date().toISOString() : null),
    updated_by: actorId,
  };

  const { data, error } = await client
    .from("health_zones")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Gagal memperbarui zona admin", { code: error.code });
    return {
      data: null,
      error:
        error.code === "23505"
          ? "Slug atau kode zona sudah digunakan."
          : "Zona kesehatan belum dapat diperbarui.",
    };
  }

  return { data, error: null };
}

export async function deleteHealthZone(
  id: string,
  role: StaffRole,
): Promise<AdminHealthZoneResult<{ id: string }>> {
  if (role !== "admin") {
    return { data: null, error: "Hanya admin yang dapat menghapus zona." };
  }

  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { error } = await client.from("health_zones").delete().eq("id", id);

  if (error) {
    console.error("Gagal menghapus zona admin", { code: error.code });
    return { data: null, error: "Zona kesehatan belum dapat dihapus." };
  }

  return { data: { id }, error: null };
}
