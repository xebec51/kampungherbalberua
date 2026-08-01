// Bulk-exports every published street ("jalan"), health zone ("zona"), and
// plant ("tanaman") QR code to data/qrcodes/{jalan,zona,tanaman}/ as SVG +
// PNG, plus a manifest.json index. Read-only against Supabase (anon/
// publishable key only -- streets/health_zones/plants all grant anon SELECT
// on published rows, see supabase/migrations/*_create_*.sql RLS policies),
// so this is safe to run against production.
//
// QR pixel/target parameters below are kept byte-identical to
// src/lib/qr/health-zone-qr.ts and the *_qr_key_format check constraints
// (supabase/migrations/20260729183000_add_public_qr_keys.sql,
// 20260802020000_add_plant_public_qr_key.sql) on purpose -- this script
// cannot import that module directly because it uses the "@/" path alias,
// which plain `node --experimental-strip-types` does not resolve.
//
// Usage:
//   node --experimental-strip-types scripts/qr/export-all.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import type { Database } from "../../src/lib/supabase/database.types.ts";

const productionQrSiteUrl = "https://kampungherbalberua.web.id";
const outDir = resolve(process.cwd(), "data/qrcodes");

type EntityCategory = "jalan" | "tanaman" | "zona";

const categoryPathSegment: Record<EntityCategory, string> = {
  jalan: "jalan",
  tanaman: "tanaman",
  zona: "zona",
};

type ManifestEntry = {
  category: EntityCategory;
  name: string;
  pngPath: string;
  qrKey: string;
  slug: string;
  svgPath: string;
  targetUrl: string;
};

function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) {
    return {};
  }

  const values: Record<string, string> = {};

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    values[key] = rawValue.replace(/^["']|["']$/g, "");
  }

  return values;
}

function loadSupabasePublicConfig() {
  const fileValues = parseEnvFile(resolve(process.cwd(), ".env.local"));
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? fileValues.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    fileValues.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum diatur (.env.local).",
    );
  }

  return { publishableKey, url };
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createQrSvg(targetUrl: string) {
  return QRCode.toString(targetUrl, {
    color: { dark: "#17211b", light: "#ffffff" },
    errorCorrectionLevel: "M",
    margin: 4,
    type: "svg",
    width: 1024,
  });
}

async function createQrPng(targetUrl: string) {
  return QRCode.toBuffer(targetUrl, {
    color: { dark: "#17211b", light: "#ffffff" },
    errorCorrectionLevel: "M",
    margin: 4,
    type: "png",
    width: 1024,
  });
}

async function exportEntity(
  category: EntityCategory,
  qrKey: string,
  slug: string,
  name: string,
  manifest: ManifestEntry[],
) {
  const targetUrl = `${productionQrSiteUrl}/qr/${categoryPathSegment[category]}/${qrKey}`;
  const filenameBase = `qr-${category}-${safeFileName(qrKey)}`;
  const svgPath = resolve(outDir, category, `${filenameBase}.svg`);
  const pngPath = resolve(outDir, category, `${filenameBase}.png`);

  const [svg, png] = await Promise.all([
    createQrSvg(targetUrl),
    createQrPng(targetUrl),
  ]);

  writeFileSync(svgPath, svg, "utf8");
  writeFileSync(pngPath, png);

  manifest.push({
    category,
    name,
    pngPath: relative(process.cwd(), pngPath).replaceAll("\\", "/"),
    qrKey,
    slug,
    svgPath: relative(process.cwd(), svgPath).replaceAll("\\", "/"),
    targetUrl,
  });
}

async function main() {
  const { url, publishableKey } = loadSupabasePublicConfig();
  const client = createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  for (const category of Object.keys(categoryPathSegment) as EntityCategory[]) {
    mkdirSync(resolve(outDir, category), { recursive: true });
  }

  const manifest: ManifestEntry[] = [];

  const { data: streets, error: streetsError } = await client
    .from("streets")
    .select("qr_key, slug, street_name")
    .eq("content_status", "published")
    .order("street_name", { ascending: true });

  if (streetsError) {
    throw streetsError;
  }

  for (const street of streets ?? []) {
    await exportEntity("jalan", street.qr_key, street.slug, street.street_name, manifest);
  }

  const { data: zones, error: zonesError } = await client
    .from("health_zones")
    .select("qr_key, slug, zone_name")
    .eq("content_status", "published")
    .order("zone_name", { ascending: true });

  if (zonesError) {
    throw zonesError;
  }

  for (const zone of zones ?? []) {
    await exportEntity("zona", zone.qr_key, zone.slug, zone.zone_name, manifest);
  }

  const { data: plants, error: plantsError } = await client
    .from("plants")
    .select("qr_key, slug, local_name")
    .eq("content_status", "published")
    .order("local_name", { ascending: true });

  if (plantsError) {
    throw plantsError;
  }

  for (const plant of plants ?? []) {
    await exportEntity("tanaman", plant.qr_key, plant.slug, plant.local_name, manifest);
  }

  writeFileSync(
    resolve(outDir, "manifest.json"),
    `${JSON.stringify(
      {
        counts: {
          jalan: streets?.length ?? 0,
          tanaman: plants?.length ?? 0,
          zona: zones?.length ?? 0,
        },
        entities: manifest,
        sourceUrl: url,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(
    `QR export selesai: jalan=${streets?.length ?? 0}, zona=${zones?.length ?? 0}, tanaman=${plants?.length ?? 0}, total file=${manifest.length * 2}.`,
  );
}

main().catch((error) => {
  console.error("qr:export gagal:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
