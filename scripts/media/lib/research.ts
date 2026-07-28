import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/supabase/database.types.ts";
import {
  type WikimediaCandidate,
  searchWikimediaImages,
} from "./wikimedia.ts";

type ResearchPlant = {
  id: string;
  local_name: string;
  plant_code: string | null;
  scientific_name: string | null;
  identification_status?: string | null;
};

export type PlantImageManifestItem = {
  accessedAt: string | null;
  altText: string;
  attribution: string | null;
  candidateScore: number;
  creator: string | null;
  decision: "approved" | "rejected" | "unresolved";
  decisionReason: string;
  entityKey: string;
  entityType: "plant";
  imageRole: "cover";
  license: string | null;
  licenseUrl: string | null;
  localName: string;
  plantCode: string | null;
  scientificName: string | null;
  selectionReason: string | null;
  sourceFile: string | null;
  sourcePage: string | null;
  sourceScientificName: string | null;
  status: string;
};

type PlantImageResearchSummary = {
  approved: number;
  candidates: number;
  eligiblePlants: number;
  fullResearchCompleted: boolean;
  rejected: number;
  unresolved: number;
  wikimediaRequests: number;
};

const REJECTED_TITLE_MARKERS = [
  "watermark",
  "logo",
  "collage",
  "packaging",
  "powder",
  "bubuk",
  "product",
  "spice",
  "ground",
  "molida",
  "medicine",
  "tablet",
  "capsule",
];

function containsExactScientificName(
  candidate: WikimediaCandidate,
  scientificName: string,
) {
  const haystack = [
    candidate.title,
    candidate.fileTitle,
    candidate.description,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(scientificName.toLowerCase());
}

export function scorePlantCandidate(
  candidate: WikimediaCandidate,
  scientificName: string,
) {
  let score = 0;
  const reasons: string[] = [];
  const text = `${candidate.fileTitle} ${candidate.title} ${candidate.description}`.toLowerCase();

  if (containsExactScientificName(candidate, scientificName)) {
    score += 45;
    reasons.push("nama ilmiah exact match");
  }

  if (candidate.width >= 1200 || candidate.height >= 1200) {
    score += 15;
    reasons.push("resolusi memadai");
  }

  if (candidate.licenseStatus === "approved") {
    score += 20;
    reasons.push("lisensi whitelist");
  }

  if (candidate.creatorName || candidate.attributionText) {
    score += 10;
    reasons.push("kreator/atribusi tersedia");
  }

  if (/whole|plant|habit|leaf|flower|rhizome|root/.test(text)) {
    score += 8;
    reasons.push("detail botani berguna");
  }

  if (REJECTED_TITLE_MARKERS.some((marker) => text.includes(marker))) {
    score -= 50;
    reasons.push("indikasi watermark/produk/kolase");
  }

  return {
    reason: reasons.join("; ") || "metadata kandidat terbatas",
    score,
  };
}

function decideCandidate(
  plant: ResearchPlant,
  candidates: WikimediaCandidate[],
): PlantImageManifestItem {
  const scientificName = plant.scientific_name?.trim() || null;

  if (!scientificName) {
    return {
      accessedAt: null,
      altText: `Placeholder tanaman ${plant.local_name}`,
      attribution: null,
      candidateScore: 0,
      creator: null,
      decision: "unresolved",
      decisionReason: "Nama ilmiah belum tersedia.",
      entityKey: plant.id,
      entityType: "plant",
      imageRole: "cover",
      license: null,
      licenseUrl: null,
      localName: plant.local_name,
      plantCode: plant.plant_code,
      scientificName,
      selectionReason: null,
      sourceFile: null,
      sourcePage: null,
      sourceScientificName: scientificName,
      status: "unresolved",
    };
  }

  const scored = candidates
    .map((candidate) => ({
      candidate,
      ...scorePlantCandidate(candidate, scientificName),
    }))
    .sort((a, b) => b.score - a.score);
  const winner = scored[0];

  if (!winner) {
    return {
      accessedAt: null,
      altText: `Placeholder tanaman ${plant.local_name}`,
      attribution: null,
      candidateScore: 0,
      creator: null,
      decision: "unresolved",
      decisionReason: "Tidak ada kandidat Wikimedia Commons.",
      entityKey: plant.id,
      entityType: "plant",
      imageRole: "cover",
      license: null,
      licenseUrl: null,
      localName: plant.local_name,
      plantCode: plant.plant_code,
      scientificName,
      selectionReason: null,
      sourceFile: null,
      sourcePage: null,
      sourceScientificName: scientificName,
      status: "unresolved",
    };
  }

  const candidate = winner.candidate;
  const exactMatch = containsExactScientificName(candidate, scientificName);
  const hasRequiredMetadata =
    Boolean(candidate.sourcePageUrl) &&
    Boolean(candidate.sourceFileUrl) &&
    Boolean(candidate.licenseCode) &&
    Boolean(candidate.licenseUrl) &&
    Boolean(candidate.creatorName || candidate.attributionText);
  const longEnough = Math.max(candidate.width, candidate.height) >= 1200;
  const cleanEnough = winner.score >= 80;

  if (
    exactMatch &&
    candidate.licenseStatus === "approved" &&
    hasRequiredMetadata &&
    longEnough &&
    cleanEnough
  ) {
    return {
      accessedAt: new Date().toISOString(),
      altText: `Foto tanaman ${plant.local_name} (${scientificName})`,
      attribution: candidate.attributionText,
      candidateScore: winner.score,
      creator: candidate.creatorName,
      decision: "approved",
      decisionReason: winner.reason,
      entityKey: plant.id,
      entityType: "plant",
      imageRole: "cover",
      license: candidate.licenseCode,
      licenseUrl: candidate.licenseUrl,
      localName: plant.local_name,
      plantCode: plant.plant_code,
      scientificName,
      selectionReason: winner.reason,
      sourceFile: candidate.sourceFileUrl,
      sourcePage: candidate.sourcePageUrl,
      sourceScientificName: scientificName,
      status: "approved",
    };
  }

  return {
    accessedAt: new Date().toISOString(),
    altText: `Placeholder tanaman ${plant.local_name}`,
    attribution: candidate.attributionText,
    candidateScore: winner.score,
    creator: candidate.creatorName,
    decision: candidate.licenseStatus === "rejected" ? "rejected" : "unresolved",
    decisionReason: exactMatch
      ? `Kandidat belum memenuhi semua syarat auto-approval: ${winner.reason}`
      : "Nama ilmiah exact match tidak terbukti pada metadata/deskripsi.",
    entityKey: plant.id,
    entityType: "plant",
    imageRole: "cover",
    license: candidate.licenseCode,
    licenseUrl: candidate.licenseUrl,
    localName: plant.local_name,
    plantCode: plant.plant_code,
    scientificName,
    selectionReason: winner.reason,
    sourceFile: candidate.sourceFileUrl,
    sourcePage: candidate.sourcePageUrl,
    sourceScientificName: scientificName,
    status: candidate.licenseStatus,
  };
}

function writeJson(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function getResearchPlants(
  supabase: SupabaseClient<Database>,
  options: { limit?: number; only?: string },
) {
  let query = supabase
    .from("plants")
    .select("id, plant_code, local_name, scientific_name, identification_status")
    .not("scientific_name", "is", null)
    .in("identification_status", ["candidate", "confirmed"]);

  if (options.only) {
    query = query.or(
      `slug.eq.${options.only},plant_code.eq.${options.only},local_name.ilike.%${options.only}%`,
    );
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal membaca tanaman untuk riset: ${error.message}`);
  }

  return (data ?? []) as ResearchPlant[];
}

export async function researchPlantImages(
  supabase: SupabaseClient<Database>,
  options: { limit?: number; only?: string },
) {
  const plants = await getResearchPlants(supabase, options);
  const manifest: PlantImageManifestItem[] = [];
  let wikimediaRequests = 0;

  for (const plant of plants) {
    const scientificName = plant.scientific_name?.trim();
    const candidates = scientificName
      ? await searchWikimediaImages(scientificName, 5)
      : [];

    if (scientificName) {
      wikimediaRequests += 1;
    }

    manifest.push(decideCandidate(plant, candidates));
  }

  const unresolved = manifest.filter((item) => item.decision === "unresolved");
  const rejected = manifest.filter((item) => item.decision === "rejected");
  const summary: PlantImageResearchSummary = {
    approved: manifest.filter((item) => item.decision === "approved").length,
    candidates: manifest.length,
    eligiblePlants: plants.length,
    fullResearchCompleted: plants.length > 0 && unresolved.length === 0,
    rejected: rejected.length,
    unresolved: unresolved.length,
    wikimediaRequests,
  };

  writeJson("data/media/manifests/plant-images.json", manifest);
  writeJson("data/media/reports/rejected-images.json", rejected);
  writeJson("data/media/reports/plant-image-summary.json", summary);

  return summary;
}
