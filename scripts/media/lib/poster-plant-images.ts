import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { posterPlantSearchAliases } from "../../../data/poster-plants/search-aliases.ts";
import type { Database } from "../../../src/lib/supabase/database.types.ts";
import type { MediaRelevanceStatus } from "../../../src/types/index.ts";
import {
  downloadImage,
  optimizeWebp,
  sha256,
  storageKey,
  uploadNoOverwrite,
} from "./media-files.ts";
import { normalizePlantName, POSTER_SOURCE_CODE } from "./poster.ts";
import { searchWikimediaImages, type WikimediaCandidate } from "./wikimedia.ts";

type MediaRow = Database["public"]["Tables"]["media_assets"]["Row"];

type PosterPlantImageSummary = {
  uniquePosterNames: number;
  catalogItems: number;
  catalogItemsWithImage: number;
  linkedPlants: number;
  posterOnlyItems: number;
  reusedPlantMedia: number;
  searchedNames: number;
  wikimediaRequests: number;
  exactImages: number;
  commonNameImages: number;
  correctedSpellingImages: number;
  materialImages: number;
  illustrationImages: number;
  approvedImages: number;
  genericFallbackImages: number;
  duplicateMediaReused: number;
  uploadedOriginals: number;
  uploadedDerivatives: number;
  attachmentCount: number;
  storageBytes: number;
  failures: string[];
  retries: number;
};

type PosterPlantImageReportItem = {
  rawName: string;
  normalizedName: string;
  slug: string;
  linkedPlantId: string | null;
  imageSource: "plant_media" | "poster_label_media" | "generic_wikimedia";
  imageIsIllustration: boolean;
  imageRelevanceStatus: MediaRelevanceStatus;
  mediaId: string | null;
  sourcePageUrl: string | null;
  licenseCode: string | null;
};

type PosterGroup = {
  rawName: string;
  normalizedName: string;
  slug: string;
  linkedPlantId: string | null;
};

type LabelMedia = {
  mediaId: string;
  media: MediaRow | null;
};

type QualityReviewRow = {
  entity_key: string;
  relevance_status: MediaRelevanceStatus;
};

type CandidateReview = {
  candidate: WikimediaCandidate;
  query: string;
  relevanceStatus: MediaRelevanceStatus;
  score: number;
  selectionReason: string;
};

type ResearchReportItem = {
  rawName: string;
  normalizedName: string;
  slug: string;
  queries: string[];
  selected: null | {
    fileTitle: string;
    licenseCode: string | null;
    relevanceStatus: MediaRelevanceStatus;
    score: number;
    sourcePageUrl: string;
  };
  rejected: Array<{ fileTitle: string; reason: string; score: number }>;
};

type ReplacementReportItem = {
  rawName: string;
  slug: string;
  oldMediaId: string | null;
  newMediaId: string | null;
  relevanceStatus: MediaRelevanceStatus;
  score: number;
  sourcePageUrl: string;
};

const GENERIC_WIKIMEDIA_QUERY = "herbal plants";
const BAD_TITLE_PATTERN =
  /\b(logo|capsule|tablet|pill|powder|bubuk|market|packaging|bottle|extract|screenshot|factory|processing plant|pabrik|text|taxi|license plates|car|hunter|portrait|people|person|man|woman|pdf|molida|ground|aphid|aphids|blattlause|blattläuse|rima|dyed|thread|diagram|vocabulary|djvu|beach|beaches|hotel)\b/i;

function writeJson(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function slugify(value: string) {
  return normalizePlantName(value).replace(/\s+/g, "-") || "tanaman-poster";
}

function makeStableSlug(rawName: string, usedSlugs: Set<string>) {
  const baseSlug = slugify(rawName);
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

function isGenericMedia(media: MediaRow | null) {
  if (!media) return true;
  return media.title === "Ilustrasi referensi tanaman herbal poster";
}

function isApprovedCandidate(candidate: WikimediaCandidate) {
  return (
    candidate.licenseStatus === "approved" &&
    Boolean(candidate.sourcePageUrl) &&
    Boolean(candidate.sourceFileUrl) &&
    Boolean(candidate.licenseCode) &&
    Boolean(candidate.licenseUrl) &&
    Boolean(candidate.creatorName || candidate.attributionText) &&
    Math.max(candidate.width, candidate.height) >= 1200 &&
    !BAD_TITLE_PATTERN.test(
      `${candidate.title} ${candidate.fileTitle} ${candidate.description}`,
    )
  );
}

function isRejectedForGroup(group: PosterGroup, candidate: WikimediaCandidate) {
  const haystack = normalizePlantName(
    `${candidate.title} ${candidate.fileTitle} ${candidate.description}`,
  );
  const titleStack = normalizePlantName(`${candidate.title} ${candidate.fileTitle}`);

  if (candidate.title.includes("?") || candidate.fileTitle.includes("?")) {
    return true;
  }

  if (
    group.normalizedName === "brokoli" &&
    /gongylodes|kohlrabi|rotkohl|red cabbage|cabbage/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "cincau" &&
    /processing plant|factory|pabrik|es cincau|drink|beverage|minuman/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "daun jambu" &&
    (!/guava|psidium|jambu/.test(titleStack) ||
      /\b(kerengga|ant|semut)\b/.test(titleStack))
  ) {
    return true;
  }

  if (
    group.normalizedName === "delima" &&
    !/pomegranate|punica|granatum/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "dong quai" &&
    !/dong quai|dang gui|angelica sinensis/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "keladi tikus" &&
    !/typhonium|keladi|tikus|rodent tuber/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "kulit manggis" &&
    !/mangosteen|manggis|garcinia mangostana|pericarp|peel/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "melati" &&
    (!/jasmine|jasminum|melati/.test(haystack) || /blue jasmine/.test(haystack))
  ) {
    return true;
  }

  if (group.normalizedName === "miswak" && /\bpollen\b/.test(haystack)) {
    return true;
  }

  if (
    group.normalizedName === "pala" &&
    !/nutmeg|myristica fragrans/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "paliasa" &&
    !/kleinhovia|paliasa/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "pare" &&
    !/bitter melon|momordica|pare/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "rambut jagung" &&
    !/corn silk|zea mays|maize silk|jagung/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "saga" &&
    !/abrus precatorius|saga seed|saga rambat/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "salam" &&
    !/syzygium|indonesian bay|daun salam|salam leaf/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "seledri" &&
    !/celery|apium graveolens|seledri/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "tapak liman" &&
    !/elephantopus|tapak liman/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "teh hijau" &&
    !/camellia sinensis|green tea plant|tea plant|teh hijau/.test(haystack)
  ) {
    return true;
  }

  if (
    group.normalizedName === "wortel" &&
    !/carrot|daucus carota|wortel/.test(haystack)
  ) {
    return true;
  }

  return false;
}

function buildQueries(group: PosterGroup) {
  const aliases = posterPlantSearchAliases[group.normalizedName] ?? [];
  return Array.from(
    new Set([
      `${group.rawName} plant`,
      group.rawName,
      group.normalizedName,
      ...aliases,
      ...aliases.map((alias) => `${alias} plant`),
    ].filter(Boolean)),
  ).slice(0, 8);
}

function classifyQuery(group: PosterGroup, query: string): MediaRelevanceStatus {
  const normalizedQuery = normalizePlantName(query.replace(/\bplant\b/i, ""));
  const aliases = new Set(posterPlantSearchAliases[group.normalizedName] ?? []);

  if (normalizedQuery === group.normalizedName) {
    return "common_name_match";
  }

  if (aliases.has(query) || aliases.has(normalizedQuery)) {
    if (
      group.normalizedName.includes("bark") ||
      group.normalizedName.includes("kulit") ||
      group.normalizedName.includes("biji") ||
      group.normalizedName.includes("daun")
    ) {
      return "material_match";
    }

    return "corrected_spelling_match";
  }

  return "illustration_reference";
}

function scoreCandidate(
  group: PosterGroup,
  query: string,
  candidate: WikimediaCandidate,
) {
  if (!isApprovedCandidate(candidate) || isRejectedForGroup(group, candidate)) {
    return {
      relevanceStatus: "generic_fallback" as MediaRelevanceStatus,
      score: 0,
      selectionReason: "lisensi, atribusi, resolusi, atau judul tidak lolos",
    };
  }

  const haystack = normalizePlantName(
    `${candidate.title} ${candidate.fileTitle} ${candidate.description}`,
  );
  const queryTerms = normalizePlantName(query).split(" ").filter(Boolean);
  const matchedTerms = queryTerms.filter((term) => haystack.includes(term)).length;
  const relevanceStatus = classifyQuery(group, query);
  let score = 40;

  score += matchedTerms * 12;
  score += Math.max(candidate.width, candidate.height) >= 1600 ? 8 : 0;
  score += candidate.creatorName || candidate.attributionText ? 8 : 0;
  score += candidate.mime.startsWith("image/") ? 6 : 0;

  if (relevanceStatus === "common_name_match") score += 16;
  if (relevanceStatus === "corrected_spelling_match") score += 12;
  if (relevanceStatus === "material_match") score += 10;

  return {
    relevanceStatus,
    score: Math.min(score, 100),
    selectionReason: `query=${query}; matched_terms=${matchedTerms}`,
  };
}

async function readPosterSource(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("plant_sources")
    .select("id")
    .eq("source_code", POSTER_SOURCE_CODE)
    .single();

  if (error || !data) {
    throw new Error(`Sumber poster tidak ditemukan: ${error?.message ?? "kosong"}`);
  }

  return data.id;
}

async function readPosterGroups(supabase: SupabaseClient<Database>) {
  const sourceId = await readPosterSource(supabase);
  const { data, error } = await supabase
    .from("plant_source_entries")
    .select("raw_plant_name, normalized_candidate_name, plant_id")
    .eq("source_id", sourceId)
    .order("poster_number", { ascending: true });

  if (error) {
    throw new Error(`Gagal membaca entri poster: ${error.message}`);
  }

  const usedSlugs = new Set<string>();
  const groups = new Map<string, PosterGroup>();

  for (const entry of data ?? []) {
    const normalizedName =
      entry.normalized_candidate_name ?? normalizePlantName(entry.raw_plant_name);
    const existing = groups.get(normalizedName);

    if (existing) {
      existing.linkedPlantId = existing.linkedPlantId ?? entry.plant_id;
      continue;
    }

    groups.set(normalizedName, {
      linkedPlantId: entry.plant_id,
      normalizedName,
      rawName: entry.raw_plant_name,
      slug: makeStableSlug(entry.raw_plant_name, usedSlugs),
    });
  }

  return {
    groups: Array.from(groups.values()).sort((a, b) =>
      a.rawName.localeCompare(b.rawName, "id"),
    ),
    sourceId,
  };
}

async function readPlantMediaIds(
  supabase: SupabaseClient<Database>,
  plantIds: string[],
) {
  if (plantIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("plant_media")
    .select("plant_id, media_id")
    .in("plant_id", plantIds)
    .eq("is_primary", true);

  if (error) {
    throw new Error(`Gagal membaca plant_media: ${error.message}`);
  }

  return new Map((data ?? []).map((row) => [row.plant_id, row.media_id]));
}

async function readLabelMedia(
  supabase: SupabaseClient<Database>,
  sourceId: string,
) {
  const { data, error } = await supabase
    .from("plant_source_label_media")
    .select("normalized_name, media_id, media_assets(*)")
    .eq("source_id", sourceId)
    .eq("is_primary", true);

  if (error) {
    throw new Error(`Gagal membaca media label poster: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((row) => [
      row.normalized_name,
      {
        media: row.media_assets as MediaRow | null,
        mediaId: row.media_id,
      } satisfies LabelMedia,
    ]),
  );
}

async function readQualityReviews(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("media_quality_reviews")
    .select("entity_key, relevance_status")
    .eq("entity_type", "poster_plant");

  if (error) {
    throw new Error(`Gagal membaca review kualitas media: ${error.message}`);
  }

  return new Map(
    ((data ?? []) as QualityReviewRow[]).map((row) => [
      row.entity_key,
      row.relevance_status,
    ]),
  );
}

async function researchBestCandidate(
  group: PosterGroup,
  options: { minScore: number },
) {
  const queries = buildQueries(group);
  const rejected: ResearchReportItem["rejected"] = [];
  let best: CandidateReview | null = null;
  let requestCount = 0;

  for (const query of queries) {
    const candidates = await searchWikimediaImages(query, 6);
    requestCount += 1;

    for (const candidate of candidates) {
      const scored = scoreCandidate(group, query, candidate);

      if (scored.score < options.minScore) {
        rejected.push({
          fileTitle: candidate.fileTitle,
          reason: scored.selectionReason,
          score: scored.score,
        });
        continue;
      }

      if (!best || scored.score > best.score) {
        best = {
          candidate,
          query,
          relevanceStatus: scored.relevanceStatus,
          score: scored.score,
          selectionReason: scored.selectionReason,
        };
      }
    }
  }

  return { best, queries, rejected, requestCount };
}

async function upsertMediaAssetForCandidate(
  supabase: SupabaseClient<Database>,
  group: PosterGroup,
  selected: CandidateReview,
) {
  const downloaded = await downloadImage(selected.candidate.sourceFileUrl);
  const original = await optimizeWebp(downloaded.buffer, 2200, 2200);
  const publicVariant = await optimizeWebp(downloaded.buffer, 1200, 900);
  const checksum = sha256(publicVariant.data);
  const entityKey = `poster-${group.slug}`;
  const originalPath = storageKey({
    entityKey,
    hash: checksum,
    role: "original",
    scope: "plants",
  });
  const publicPath = storageKey({
    entityKey,
    hash: checksum,
    role: "cover",
    scope: "plants",
  });

  const originalUpload = await uploadNoOverwrite(
    supabase,
    "media-originals",
    originalPath,
    original.data,
  );
  const publicUpload = await uploadNoOverwrite(
    supabase,
    "media-public",
    publicPath,
    publicVariant.data,
  );
  const { data: existing, error: existingError } = await supabase
    .from("media_assets")
    .select("id")
    .eq("checksum_sha256", checksum)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Gagal mencari media checksum: ${existingError.message}`);
  }

  if (existing?.id) {
    return {
      duplicateReused: 1,
      mediaId: existing.id,
      originalUploaded: originalUpload === "uploaded" ? 1 : 0,
      publicUploaded: publicUpload === "uploaded" ? 1 : 0,
      retries: downloaded.retries,
      storageBytes: publicVariant.data.length,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("media_assets")
    .insert({
      alt_text:
        selected.relevanceStatus === "common_name_match"
          ? `Foto referensi tanaman ${group.rawName}`
          : `Ilustrasi referensi untuk tanaman ${group.rawName}`,
      asset_code: `media-${checksum.slice(0, 16)}`,
      attribution_text: selected.candidate.attributionText,
      caption: `Gambar referensi untuk nama poster ${group.rawName}.`,
      changes_made:
        "Metadata EXIF/GPS dihapus; dikonversi ke WebP; ukuran disesuaikan untuk web.",
      checksum_sha256: checksum,
      content_status: "published",
      creator_name: selected.candidate.creatorName,
      file_size_bytes: publicVariant.data.length,
      height: publicVariant.info.height,
      image_type:
        selected.relevanceStatus === "common_name_match" ? "cover" : "illustration",
      license_code: selected.candidate.licenseCode,
      license_url: selected.candidate.licenseUrl,
      media_kind: "image",
      mime_type: "image/webp",
      original_bucket: "media-originals",
      original_path: originalPath,
      privacy_status: "not_required",
      public_bucket: "media-public",
      public_path: publicPath,
      rights_status: "approved",
      source_file_url: selected.candidate.sourceFileUrl,
      source_page_url: selected.candidate.sourcePageUrl,
      source_type: "wikimedia_commons",
      title: `Gambar referensi ${group.rawName}`,
      width: publicVariant.info.width,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new Error(`Gagal membuat media: ${insertError?.message ?? "kosong"}`);
  }

  return {
    duplicateReused: originalUpload === "reused" || publicUpload === "reused" ? 1 : 0,
    mediaId: inserted.id,
    originalUploaded: originalUpload === "uploaded" ? 1 : 0,
    publicUploaded: publicUpload === "uploaded" ? 1 : 0,
    retries: downloaded.retries,
    storageBytes: publicVariant.data.length,
  };
}

async function replacePosterPrimary(
  supabase: SupabaseClient<Database>,
  input: {
    group: PosterGroup;
    newMediaId: string;
    oldMediaId: string | null;
    relevanceStatus: MediaRelevanceStatus;
    sourceId: string;
    score: number;
  },
) {
  await supabase
    .from("plant_source_label_media")
    .update({ is_primary: false })
    .eq("source_id", input.sourceId)
    .eq("normalized_name", input.group.normalizedName)
    .eq("is_primary", true);

  const { error: attachError } = await supabase
    .from("plant_source_label_media")
    .upsert(
      {
        is_primary: true,
        label_as_illustration: input.relevanceStatus !== "common_name_match",
        media_id: input.newMediaId,
        normalized_name: input.group.normalizedName,
        raw_name: input.group.rawName,
        role: "cover",
        slug: input.group.slug,
        source_id: input.sourceId,
      },
      { onConflict: "source_id,normalized_name,media_id" },
    );

  if (attachError) {
    throw new Error(`Attachment baru gagal: ${attachError.message}`);
  }

  await supabase.from("media_quality_reviews").upsert(
    {
      duplicate_status: "unique",
      entity_key: input.group.slug,
      entity_type: "poster_plant",
      media_id: input.newMediaId,
      quality_status: "acceptable",
      relevance_status: input.relevanceStatus,
      review_notes: `Dipilih otomatis dari riset Wikimedia dengan skor ${input.score}.`,
    },
    { onConflict: "media_id,entity_type,entity_key" },
  );

  await supabase.from("media_attachment_history").insert({
    action: input.oldMediaId ? "replace_primary" : "attach",
    change_reason: `Riset katalog poster: ${input.relevanceStatus}; skor ${input.score}.`,
    entity_key: input.group.slug,
    entity_type: "poster_plant",
    new_media_id: input.newMediaId,
    old_media_id: input.oldMediaId,
  });
}

async function createOrReuseGenericFallback(
  supabase: SupabaseClient<Database>,
  options: { dryRun: boolean },
) {
  const candidates = await searchWikimediaImages(GENERIC_WIKIMEDIA_QUERY, 10);
  const candidate = candidates.find(isApprovedCandidate);

  if (!candidate) {
    throw new Error("Tidak ada gambar herbal generik Wikimedia yang lolos lisensi.");
  }

  if (options.dryRun) {
    return { mediaId: null, requestCount: 1 };
  }

  const selected: CandidateReview = {
    candidate,
    query: GENERIC_WIKIMEDIA_QUERY,
    relevanceStatus: "generic_fallback",
    score: 50,
    selectionReason: "fallback generik",
  };
  const genericGroup: PosterGroup = {
    linkedPlantId: null,
    normalizedName: "generic herbal",
    rawName: "Tanaman herbal",
    slug: "generic-herbal",
  };
  const created = await upsertMediaAssetForCandidate(
    supabase,
    genericGroup,
    selected,
  );
  return { mediaId: created.mediaId, requestCount: 1 };
}

export async function researchPosterPlantImages(
  supabase: SupabaseClient<Database>,
  options: {
    dryRun: boolean;
    keepExistingSpecific: boolean;
    limit?: number;
    maxReuse: number;
    minScore: number;
    offset?: number;
    only?: string;
    replaceGeneric: boolean;
  },
) {
  const { groups, sourceId } = await readPosterGroups(supabase);
  const plantIds = Array.from(
    new Set(
      groups
        .map((group) => group.linkedPlantId)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const plantMediaById = await readPlantMediaIds(supabase, plantIds);
  const labelMediaByName = await readLabelMedia(supabase, sourceId);
  const targets = groups
    .filter((group) => !options.only || group.slug === options.only)
    .filter((group) => {
      const plantMedia = group.linkedPlantId
        ? plantMediaById.get(group.linkedPlantId)
        : null;
      const labelMedia = labelMediaByName.get(group.normalizedName);

      if (plantMedia && options.keepExistingSpecific) return false;
      if (!labelMedia) return true;
      if (options.replaceGeneric && isGenericMedia(labelMedia.media)) return true;
      return !options.keepExistingSpecific && !isGenericMedia(labelMedia.media);
    })
    .slice(options.offset ?? 0, options.limit ? (options.offset ?? 0) + options.limit : undefined);
  const failures: string[] = [];
  const researchReport: ResearchReportItem[] = [];
  const replacements: ReplacementReportItem[] = [];
  const mediaReuse = new Map<string, number>();
  const relevanceByName = new Map<string, MediaRelevanceStatus>();
  let wikimediaRequests = 0;
  let uploadedOriginals = 0;
  let uploadedDerivatives = 0;
  let duplicateMediaReused = 0;
  let storageBytes = 0;
  let retries = 0;

  for (const group of targets) {
    const current = labelMediaByName.get(group.normalizedName) ?? null;
    const researched = await researchBestCandidate(group, {
      minScore: options.minScore,
    });
    wikimediaRequests += researched.requestCount;
    const selected = researched.best;

    researchReport.push({
      normalizedName: group.normalizedName,
      queries: researched.queries,
      rawName: group.rawName,
      rejected: researched.rejected.slice(0, 8),
      selected: selected
        ? {
            fileTitle: selected.candidate.fileTitle,
            licenseCode: selected.candidate.licenseCode,
            relevanceStatus: selected.relevanceStatus,
            score: selected.score,
            sourcePageUrl: selected.candidate.sourcePageUrl,
          }
        : null,
      slug: group.slug,
    });

    if (!selected) {
      failures.push(`${group.rawName}: kandidat spesifik tidak memenuhi skor`);
      continue;
    }

    if (options.dryRun) {
      continue;
    }

    try {
      const media = await upsertMediaAssetForCandidate(supabase, group, selected);
      const reuseCount = mediaReuse.get(media.mediaId) ?? 0;

      if (reuseCount >= options.maxReuse) {
        failures.push(`${group.rawName}: media melewati max reuse`);
        continue;
      }

      mediaReuse.set(media.mediaId, reuseCount + 1);
      await replacePosterPrimary(supabase, {
        group,
        newMediaId: media.mediaId,
        oldMediaId: current?.mediaId ?? null,
        relevanceStatus: selected.relevanceStatus,
        score: selected.score,
        sourceId,
      });
      labelMediaByName.set(group.normalizedName, {
        media: null,
        mediaId: media.mediaId,
      });
      relevanceByName.set(group.normalizedName, selected.relevanceStatus);
      duplicateMediaReused += media.duplicateReused;
      uploadedOriginals += media.originalUploaded;
      uploadedDerivatives += media.publicUploaded;
      storageBytes += media.storageBytes;
      retries += media.retries;
      replacements.push({
        newMediaId: media.mediaId,
        oldMediaId: current?.mediaId ?? null,
        rawName: group.rawName,
        relevanceStatus: selected.relevanceStatus,
        score: selected.score,
        slug: group.slug,
        sourcePageUrl: selected.candidate.sourcePageUrl,
      });
    } catch (error) {
      failures.push(
        `${group.rawName}: ${error instanceof Error ? error.message : "gagal"}`,
      );
    }
  }

  const missingGroups = groups.filter((group) => {
    const plantMedia = group.linkedPlantId
      ? plantMediaById.get(group.linkedPlantId)
      : null;
    return !plantMedia && !labelMediaByName.get(group.normalizedName);
  });
  const generic =
    missingGroups.length && !options.replaceGeneric
      ? await createOrReuseGenericFallback(supabase, { dryRun: options.dryRun })
      : null;

  wikimediaRequests += generic?.requestCount ?? 0;

  if (generic?.mediaId && !options.dryRun) {
    for (const group of missingGroups) {
      await replacePosterPrimary(supabase, {
        group,
        newMediaId: generic.mediaId,
        oldMediaId: null,
        relevanceStatus: "generic_fallback",
        score: 50,
        sourceId,
      });
      labelMediaByName.set(group.normalizedName, {
        media: null,
        mediaId: generic.mediaId,
      });
      relevanceByName.set(group.normalizedName, "generic_fallback");
    }
  }

  const finalLabelMediaByName = options.dryRun
    ? labelMediaByName
    : await readLabelMedia(supabase, sourceId);
  const finalRelevanceBySlug = options.dryRun
    ? new Map<string, MediaRelevanceStatus>()
    : await readQualityReviews(supabase);
  const finalPlantMediaCount = groups.filter(
    (group) => group.linkedPlantId && plantMediaById.get(group.linkedPlantId),
  ).length;
  const finalLabelRows = Array.from(finalLabelMediaByName.values());
  const finalLabelMediaCount = finalLabelRows.length;
  const uniqueLabelMedia = new Map<string, MediaRow | null>();

  for (const row of finalLabelRows) {
    uniqueLabelMedia.set(row.mediaId, row.media);
  }

  const cumulativeDuplicateMediaReused = Math.max(
    0,
    finalLabelMediaCount - uniqueLabelMedia.size,
  );
  const cumulativeStorageBytes = Array.from(uniqueLabelMedia.values()).reduce(
    (total, media) => total + (media?.file_size_bytes ?? 0),
    0,
  );
  const report: PosterPlantImageReportItem[] = groups.map((group) => {
    const plantMedia = group.linkedPlantId
      ? plantMediaById.get(group.linkedPlantId) ?? null
      : null;
    const labelMedia = finalLabelMediaByName.get(group.normalizedName) ?? null;
    const explicitRelevance = relevanceByName.get(group.normalizedName);
    const reviewedRelevance = finalRelevanceBySlug.get(group.slug);
    const isGeneric = !plantMedia && isGenericMedia(labelMedia?.media ?? null);
    const relevanceStatus = plantMedia
      ? "exact"
      : explicitRelevance ??
        reviewedRelevance ??
        (isGeneric ? "generic_fallback" : "illustration_reference");

    return {
      imageIsIllustration: !plantMedia,
      imageRelevanceStatus: relevanceStatus,
      imageSource: plantMedia
        ? "plant_media"
        : relevanceStatus === "generic_fallback"
          ? "generic_wikimedia"
          : "poster_label_media",
      licenseCode: labelMedia?.media?.license_code ?? null,
      linkedPlantId: group.linkedPlantId,
      mediaId: plantMedia ?? labelMedia?.mediaId ?? null,
      normalizedName: group.normalizedName,
      rawName: group.rawName,
      slug: group.slug,
      sourcePageUrl: labelMedia?.media?.source_page_url ?? null,
    };
  });
  const genericFallbacks = report.filter(
    (item) => item.imageRelevanceStatus === "generic_fallback",
  ).length;
  const commonNameImages = report.filter(
    (item) => item.imageRelevanceStatus === "common_name_match",
  ).length;
  const correctedSpellingImages = report.filter(
    (item) => item.imageRelevanceStatus === "corrected_spelling_match",
  ).length;
  const materialImages = report.filter(
    (item) => item.imageRelevanceStatus === "material_match",
  ).length;
  const summary: PosterPlantImageSummary = {
    approvedImages: report.filter((item) => item.mediaId).length,
    attachmentCount: finalLabelMediaCount,
    catalogItems: groups.length,
    catalogItemsWithImage: finalPlantMediaCount + finalLabelMediaCount,
    commonNameImages,
    correctedSpellingImages,
    duplicateMediaReused: options.dryRun
      ? duplicateMediaReused
      : cumulativeDuplicateMediaReused,
    exactImages: finalPlantMediaCount,
    failures,
    genericFallbackImages: genericFallbacks,
    illustrationImages: groups.length - finalPlantMediaCount,
    linkedPlants: groups.filter((group) => group.linkedPlantId).length,
    materialImages,
    posterOnlyItems: groups.filter((group) => !group.linkedPlantId).length,
    retries,
    reusedPlantMedia: finalPlantMediaCount,
    searchedNames: options.dryRun ? targets.length : finalLabelMediaCount - genericFallbacks,
    storageBytes: options.dryRun ? storageBytes : cumulativeStorageBytes,
    uniquePosterNames: groups.length,
    uploadedDerivatives: options.dryRun ? uploadedDerivatives : uniqueLabelMedia.size,
    uploadedOriginals: options.dryRun ? uploadedOriginals : uniqueLabelMedia.size,
    wikimediaRequests,
  };

  writeJson("data/media/reports/poster-plant-images.json", report);
  writeJson("data/media/reports/poster-plant-image-failures.json", failures);
  writeJson("data/media/reports/poster-plant-catalog-summary.json", summary);
  writeJson("data/media/reports/catalog-image-research.json", researchReport);
  writeJson("data/media/reports/catalog-image-replacements.json", replacements);
  writeJson("data/media/reports/catalog-image-failures.json", failures);
  return summary;
}
