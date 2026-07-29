import type {
  ContentStatus,
  Database,
  Json,
  ValidationStatus,
} from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type HerbaCodeAdminEntry =
  Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Row"] & {
    health_zones: {
      slug: string;
      zone_name: string;
    } | null;
    plants: {
      local_name: string;
      scientific_name: string | null;
      slug: string;
    } | null;
  };

export type HerbaCodeAdminHistory =
  Database["public"]["Tables"]["herbacode_entry_history"]["Row"] & {
    herbacode_plant_zone_entries: {
      local_name: string;
      zone_title: string;
    } | null;
  };

export type HerbaCodeEntryAdminInput = Pick<
  Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Update"],
  | "active_compounds"
  | "benefits"
  | "cultivation_techniques"
  | "local_name"
  | "preparation_methods"
  | "scientific_name"
  | "used_parts"
  | "warnings"
>;

export type HerbaCodeAdminFilters = {
  contentStatus?: ContentStatus | "all";
  query?: string;
  validationStatus?: ValidationStatus | "all";
};

export type AdminHerbaCodeResult<T> =
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
      error: "Supabase belum dikonfigurasi untuk dashboard HerbaCode.",
    };
  }

  return { client, error: null };
}

function diffSummary(
  previous: HerbaCodeAdminEntry,
  next: Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Row"],
): Json {
  const changed: string[] = [];
  const keys = [
    "active_compounds",
    "benefits",
    "cultivation_techniques",
    "local_name",
    "preparation_methods",
    "scientific_name",
    "used_parts",
    "warnings",
  ] as const;

  for (const key of keys) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(next[key])) {
      changed.push(key);
    }
  }

  return { changed };
}

async function writeHistory(input: {
  action: string;
  actorId: string;
  changeSummary?: Json;
  entryId: string;
}) {
  const { client } = await getAdminClient();

  if (!client) {
    return;
  }

  await client.from("herbacode_entry_history").insert({
    action: input.action,
    changed_by: input.actorId,
    change_summary: input.changeSummary ?? {},
    entry_id: input.entryId,
  });
}

export async function getHerbaCodeEntriesForAdmin(
  filters: HerbaCodeAdminFilters = {},
): Promise<AdminHerbaCodeResult<HerbaCodeAdminEntry[]>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  let query = client
    .from("herbacode_plant_zone_entries")
    .select(
      "*, plants(local_name, scientific_name, slug), health_zones(zone_name, slug)",
    )
    .order("zone_code", { ascending: true })
    .order("entry_order", { ascending: true });

  if (filters.query) {
    const escapedQuery = filters.query.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `local_name.ilike.%${escapedQuery}%,scientific_name.ilike.%${escapedQuery}%,zone_title.ilike.%${escapedQuery}%`,
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
    console.error("Gagal memuat dashboard HerbaCode", { code: error.code });
    return { data: null, error: "Data HerbaCode belum dapat dimuat." };
  }

  return { data: (data ?? []) as HerbaCodeAdminEntry[], error: null };
}

export async function getHerbaCodeEntryByIdForAdmin(
  id: string,
): Promise<AdminHerbaCodeResult<HerbaCodeAdminEntry>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { data, error } = await client
    .from("herbacode_plant_zone_entries")
    .select(
      "*, plants(local_name, scientific_name, slug), health_zones(zone_name, slug)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat entri HerbaCode", { code: error.code });
    return { data: null, error: "Entri HerbaCode belum dapat dimuat." };
  }

  if (!data) {
    return { data: null, error: "Entri HerbaCode tidak ditemukan." };
  }

  return { data: data as HerbaCodeAdminEntry, error: null };
}

export async function updateHerbaCodeEntryForAdmin(
  id: string,
  input: HerbaCodeEntryAdminInput,
  actorId: string,
): Promise<AdminHerbaCodeResult<HerbaCodeAdminEntry>> {
  const existing = await getHerbaCodeEntryByIdForAdmin(id);

  if (existing.error || !existing.data) {
    return { data: null, error: existing.error ?? "Entri tidak ditemukan." };
  }

  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { data, error } = await client
    .from("herbacode_plant_zone_entries")
    .update(input)
    .eq("id", id)
    .select(
      "*, plants(local_name, scientific_name, slug), health_zones(zone_name, slug)",
    )
    .single();

  if (error) {
    console.error("Gagal memperbarui entri HerbaCode", { code: error.code });
    return { data: null, error: "Entri HerbaCode belum dapat diperbarui." };
  }

  await writeHistory({
    action: "edit",
    actorId,
    changeSummary: diffSummary(existing.data, data),
    entryId: id,
  });

  return { data: data as HerbaCodeAdminEntry, error: null };
}

export async function setHerbaCodeEntryWorkflowForAdmin(input: {
  actorId: string;
  actorName: string | null;
  contentStatus?: ContentStatus;
  id: string;
  validationStatus?: ValidationStatus;
}): Promise<AdminHerbaCodeResult<HerbaCodeAdminEntry>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const patch: Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Update"] = {};

  if (input.contentStatus) {
    patch.content_status = input.contentStatus;
  }

  if (input.validationStatus) {
    patch.validation_status = input.validationStatus;
    patch.validator_id =
      input.validationStatus === "verified" ? input.actorId : null;
    patch.validator_name =
      input.validationStatus === "verified" ? input.actorName : null;
    patch.validated_at =
      input.validationStatus === "verified" ? new Date().toISOString() : null;
  }

  const { data, error } = await client
    .from("herbacode_plant_zone_entries")
    .update(patch)
    .eq("id", input.id)
    .select(
      "*, plants(local_name, scientific_name, slug), health_zones(zone_name, slug)",
    )
    .single();

  if (error) {
    console.error("Gagal mengubah workflow HerbaCode", { code: error.code });
    return { data: null, error: "Status HerbaCode belum dapat diperbarui." };
  }

  await writeHistory({
    action: input.validationStatus
      ? `validasi:${input.validationStatus}`
      : `status:${input.contentStatus ?? "update"}`,
    actorId: input.actorId,
    changeSummary: patch as Json,
    entryId: input.id,
  });

  return { data: data as HerbaCodeAdminEntry, error: null };
}

export async function getHerbaCodeHistoryForAdmin(
  limit = 30,
): Promise<AdminHerbaCodeResult<HerbaCodeAdminHistory[]>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { data, error } = await client
    .from("herbacode_entry_history")
    .select("*, herbacode_plant_zone_entries(local_name, zone_title)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Gagal memuat riwayat HerbaCode", { code: error.code });
    return { data: null, error: "Riwayat HerbaCode belum dapat dimuat." };
  }

  return { data: (data ?? []) as HerbaCodeAdminHistory[], error: null };
}
