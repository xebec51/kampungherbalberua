import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminMediaAuditSummary = {
  totalMedia: number;
  posterAttachments: number;
  specificPosterImages: number;
  genericPosterImages: number;
  excessiveReuse: Array<{ mediaId: string; title: string; count: number; names: string[] }>;
  lowResolution: number;
  incompleteAttribution: number;
  needsReview: number;
};

type PosterMediaAuditRow = {
  media_id: string;
  raw_name: string;
  slug: string;
  media_assets: {
    attribution_text: string | null;
    creator_name: string | null;
    height: number | null;
    id: string;
    image_type: string | null;
    license_code: string | null;
    source_page_url: string | null;
    title: string;
    width: number | null;
  } | null;
};

type ReviewRow = {
  duplicate_status: string;
  entity_key: string;
  quality_status: string;
  relevance_status: string;
};

export async function getAdminMediaAuditSummary() {
  const client = await createSupabaseServerClient();

  if (!client) {
    return { data: null, error: "Supabase belum dikonfigurasi." };
  }

  const mediaCount = await client
    .from("media_assets")
    .select("id", { count: "exact", head: true });
  const posterRows = await client
    .from("plant_source_label_media")
    .select(
      "media_id, raw_name, slug, media_assets(id,title,image_type,width,height,creator_name,attribution_text,license_code,source_page_url)",
    )
    .eq("is_primary", true);
  const reviewRows = await client
    .from("media_quality_reviews")
    .select("entity_key,relevance_status,quality_status,duplicate_status")
    .eq("entity_type", "poster_plant");

  if (mediaCount.error || posterRows.error) {
    return { data: null, error: "Audit media belum dapat dimuat." };
  }

  const rows = (posterRows.data ?? []) as PosterMediaAuditRow[];
  const reviews = (reviewRows.data ?? []) as ReviewRow[];
  const reviewBySlug = new Map(reviews.map((review) => [review.entity_key, review]));
  const usage = new Map<string, { title: string; names: string[] }>();
  let genericPosterImages = 0;
  let specificPosterImages = 0;
  let lowResolution = 0;
  let incompleteAttribution = 0;

  for (const row of rows) {
    const media = row.media_assets;

    if (!media) continue;

    const currentUsage = usage.get(row.media_id) ?? {
      names: [],
      title: media.title,
    };
    currentUsage.names.push(row.raw_name);
    usage.set(row.media_id, currentUsage);

    const review = reviewBySlug.get(row.slug) ?? null;

    if (
      media.title === "Ilustrasi referensi tanaman herbal poster" ||
      media.title === "Visual sementara katalog tanaman Kampung Herbal Harmony" ||
      review?.relevance_status === "generic_fallback"
    ) {
      genericPosterImages += 1;
    } else {
      specificPosterImages += 1;
    }

    if (Math.max(media.width ?? 0, media.height ?? 0) < 1200) {
      lowResolution += 1;
    }

    if (
      !(media.creator_name || media.attribution_text) ||
      !media.license_code ||
      !media.source_page_url
    ) {
      incompleteAttribution += 1;
    }
  }

  return {
    data: {
      excessiveReuse: Array.from(usage.entries())
        .filter(([, item]) => item.names.length > 3)
        .map(([mediaId, item]) => ({
          count: item.names.length,
          mediaId,
          names: item.names.sort((a, b) => a.localeCompare(b, "id")),
          title: item.title,
        })),
      genericPosterImages,
      incompleteAttribution,
      lowResolution,
      needsReview: reviews.filter(
        (review) =>
          review.relevance_status === "needs_review" ||
          review.quality_status === "needs_review",
      ).length,
      posterAttachments: rows.length,
      specificPosterImages,
      totalMedia: mediaCount.count ?? 0,
    } satisfies AdminMediaAuditSummary,
    error: null,
  };
}
