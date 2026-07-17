import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDashboardStats = {
  archivedPlants: number;
  draftPlants: number;
  pendingReviewPlants: number;
  pendingVerificationItems: number;
  publishedPlants: number;
  totalHealthZones: number | null;
  totalPlants: number;
  zoneDrafts: number | null;
  zonePublished: number | null;
};

export type AdminDashboardStatsResult =
  | {
      data: AdminDashboardStats;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

type PlantCountFilter =
  | {
      column: "content_status";
      value: "archived" | "draft" | "pending_review" | "published";
    }
  | {
      column: "validation_status";
      value: "pending";
    };

async function countPlants(filter?: PlantCountFilter) {
  const client = await createSupabaseServerClient();

  if (!client) {
    return { count: null, error: "Supabase belum dikonfigurasi." };
  }

  let query = client.from("plants").select("*", {
    count: "exact",
    head: true,
  });

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Gagal menghitung data dashboard admin", { code: error.code });
    return { count: null, error: "Data dashboard belum dapat dimuat." };
  }

  return { count: count ?? 0, error: null };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStatsResult> {
  const [
    totalPlants,
    draftPlants,
    pendingReviewPlants,
    publishedPlants,
    archivedPlants,
    pendingVerificationPlants,
  ] = await Promise.all([
    countPlants(),
    countPlants({ column: "content_status", value: "draft" }),
    countPlants({ column: "content_status", value: "pending_review" }),
    countPlants({ column: "content_status", value: "published" }),
    countPlants({ column: "content_status", value: "archived" }),
    countPlants({ column: "validation_status", value: "pending" }),
  ]);

  const counts = [
    totalPlants,
    draftPlants,
    pendingReviewPlants,
    publishedPlants,
    archivedPlants,
    pendingVerificationPlants,
  ];
  const firstError = counts.find((result) => result.error)?.error;

  if (firstError) {
    return {
      data: null,
      error: firstError,
    };
  }

  return {
    data: {
      archivedPlants: archivedPlants.count ?? 0,
      draftPlants: draftPlants.count ?? 0,
      pendingReviewPlants: pendingReviewPlants.count ?? 0,
      pendingVerificationItems: pendingVerificationPlants.count ?? 0,
      publishedPlants: publishedPlants.count ?? 0,
      totalHealthZones: null,
      totalPlants: totalPlants.count ?? 0,
      zoneDrafts: null,
      zonePublished: null,
    },
    error: null,
  };
}
