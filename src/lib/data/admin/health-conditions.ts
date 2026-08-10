import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/auth/permissions";

export type HealthConditionAdminRecord =
  Database["public"]["Tables"]["health_conditions"]["Row"];

export type HealthConditionPlantLink = {
  display_name: string;
  plant_id: string | null;
  plant_local_name: string | null;
  plant_slug: string | null;
};

export type HealthConditionAdminDetail = HealthConditionAdminRecord & {
  linkedPlants: HealthConditionPlantLink[];
};

export type HealthConditionAdminInput = {
  benefits: string[];
  description: string;
  linkedPlantNames: string[];
  name: string;
  short_description: string;
  slug: string;
  sort_order: number;
};

export type HealthConditionAdminFilters = {
  query?: string;
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

// Adapted from scripts/herbacode/import.ts's normalizeHerbaCodeName -- exact
// same NFKD-fold-and-strip normalization, kept in sync deliberately so a
// name that matches during HerbaCode import also matches here. No fuzzy
// matching and no scientific-name fallback: an admin typing a real plant
// name can fix a typo themselves, unlike the one-shot document importer.
// Built from an escaped string (not a literal regex) so the combining-mark
// range can't be accidentally corrupted by editor/encoding round-trips.
const COMBINING_DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function normalizePlantName(value: string) {
  return value
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type PlantAliasSource = {
  id: string;
  local_name: string;
  other_names: string[];
  slug: string;
};

type PlantAliasTarget = {
  id: string;
  local_name: string;
  slug: string;
};

function buildPlantAliasIndex(plants: PlantAliasSource[]) {
  const aliases = new Map<string, PlantAliasTarget>();

  for (const plant of plants) {
    const candidates = [
      plant.local_name,
      plant.slug,
      plant.slug.replaceAll("-", " "),
      ...plant.other_names,
    ];

    for (const candidate of candidates) {
      const normalized = normalizePlantName(candidate);

      if (normalized && !aliases.has(normalized)) {
        aliases.set(normalized, {
          id: plant.id,
          local_name: plant.local_name,
          slug: plant.slug,
        });
      }
    }
  }

  return aliases;
}

type ResolvedPlantLink = {
  display_name: string;
  plant_id: string | null;
  sort_order: number;
};

async function resolveLinkedPlantNames(
  client: NonNullable<Awaited<ReturnType<typeof getAdminClient>>["client"]>,
  names: string[],
): Promise<AdminMutationResult<ResolvedPlantLink[]>> {
  const trimmedNames = names.map((name) => name.trim()).filter(Boolean);

  if (trimmedNames.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await client
    .from("plants")
    .select("id, local_name, slug, other_names")
    .eq("content_status", "published");

  if (error) {
    console.error("Gagal memuat daftar tanaman untuk pencocokan penyakit", {
      code: error.code,
    });
    return { data: null, error: "Daftar tanaman belum dapat dimuat untuk mencocokkan nama." };
  }

  const aliasIndex = buildPlantAliasIndex(data ?? []);
  const resolved = trimmedNames.map((displayName, index) => {
    const match = aliasIndex.get(normalizePlantName(displayName));

    return {
      display_name: displayName,
      plant_id: match?.id ?? null,
      sort_order: index + 1,
    };
  });

  return { data: resolved, error: null };
}

export async function getAllHealthConditionsForAdmin(
  filters: HealthConditionAdminFilters = {},
): Promise<AdminMutationResult<HealthConditionAdminRecord[]>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  let query = client
    .from("health_conditions")
    .select("*")
    .order("sort_order", { ascending: true });

  if (filters.query) {
    const escapedQuery = filters.query.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(`name.ilike.%${escapedQuery}%,slug.ilike.%${escapedQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Gagal memuat daftar penyakit admin", { code: error.code });
    return { data: null, error: "Daftar penyakit belum dapat dimuat." };
  }

  return { data: data ?? [], error: null };
}

export async function getHealthConditionByIdForAdmin(
  id: string,
): Promise<AdminMutationResult<HealthConditionAdminDetail>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { data, error } = await client
    .from("health_conditions")
    .select(
      "*, health_condition_plants(display_name, sort_order, plants(id, local_name, slug))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat detail penyakit admin", { code: error.code });
    return { data: null, error: "Data penyakit belum dapat dimuat." };
  }

  if (!data) {
    return { data: null, error: "Penyakit tidak ditemukan." };
  }

  const { health_condition_plants: rawLinks, ...condition } = data;
  const linkedPlants: HealthConditionPlantLink[] = (rawLinks ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => ({
      display_name: link.display_name,
      plant_id: link.plants?.id ?? null,
      plant_local_name: link.plants?.local_name ?? null,
      plant_slug: link.plants?.slug ?? null,
    }));

  return { data: { ...condition, linkedPlants }, error: null };
}

async function replaceLinkedPlants(
  client: NonNullable<Awaited<ReturnType<typeof getAdminClient>>["client"]>,
  healthConditionId: string,
  linkedPlantNames: string[],
): Promise<AdminMutationResult<true>> {
  const resolved = await resolveLinkedPlantNames(client, linkedPlantNames);

  if (!resolved.data) {
    return { data: null, error: resolved.error };
  }

  const { error: deleteError } = await client
    .from("health_condition_plants")
    .delete()
    .eq("health_condition_id", healthConditionId);

  if (deleteError) {
    console.error("Gagal memperbarui daftar tanaman terkait", { code: deleteError.code });
    return { data: null, error: "Daftar tanaman terkait belum dapat diperbarui." };
  }

  if (resolved.data.length === 0) {
    return { data: true, error: null };
  }

  const { error: insertError } = await client.from("health_condition_plants").insert(
    resolved.data.map((link) => ({
      health_condition_id: healthConditionId,
      plant_id: link.plant_id,
      display_name: link.display_name,
      sort_order: link.sort_order,
    })),
  );

  if (insertError) {
    console.error("Gagal menyimpan daftar tanaman terkait", { code: insertError.code });
    return { data: null, error: "Daftar tanaman terkait belum dapat disimpan." };
  }

  return { data: true, error: null };
}

export async function createHealthCondition(
  input: HealthConditionAdminInput,
  actorId: string,
): Promise<AdminMutationResult<HealthConditionAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { linkedPlantNames, ...conditionFields } = input;
  const payload: Database["public"]["Tables"]["health_conditions"]["Insert"] = {
    ...conditionFields,
    created_by: actorId,
    updated_by: actorId,
  };

  const { data, error } = await client
    .from("health_conditions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Gagal membuat penyakit admin", { code: error.code });
    return {
      data: null,
      error: error.code === "23505" ? "Slug penyakit sudah dipakai." : "Penyakit belum dapat dibuat.",
    };
  }

  const linkResult = await replaceLinkedPlants(client, data.id, linkedPlantNames);

  if (!linkResult.data) {
    return { data: null, error: linkResult.error };
  }

  return { data, error: null };
}

export async function updateHealthCondition(
  id: string,
  input: HealthConditionAdminInput,
  actorId: string,
): Promise<AdminMutationResult<HealthConditionAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { linkedPlantNames, ...conditionFields } = input;
  const payload: Database["public"]["Tables"]["health_conditions"]["Update"] = {
    ...conditionFields,
    updated_by: actorId,
  };

  const { data, error } = await client
    .from("health_conditions")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Gagal memperbarui penyakit admin", { code: error.code });
    return {
      data: null,
      error:
        error.code === "23505" ? "Slug penyakit sudah dipakai." : "Penyakit belum dapat diperbarui.",
    };
  }

  const linkResult = await replaceLinkedPlants(client, id, linkedPlantNames);

  if (!linkResult.data) {
    return { data: null, error: linkResult.error };
  }

  return { data, error: null };
}

export async function deleteHealthCondition(
  id: string,
  role: StaffRole,
): Promise<AdminMutationResult<{ id: string }>> {
  if (role !== "admin") {
    return { data: null, error: "Hanya admin yang dapat menghapus penyakit." };
  }

  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  // health_condition_plants has on delete cascade on health_condition_id, so
  // no manual link cleanup is needed here (unlike products' polymorphic
  // content_media_slots, which has no FK to cascade through).
  const { error } = await client.from("health_conditions").delete().eq("id", id);

  if (error) {
    console.error("Gagal menghapus penyakit admin", { code: error.code });
    return { data: null, error: "Penyakit belum dapat dihapus." };
  }

  return { data: { id }, error: null };
}
