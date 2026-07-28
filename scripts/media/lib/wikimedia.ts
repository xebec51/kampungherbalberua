import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { loadMediaImportEnv } from "./env.ts";
import { chooseLicense, stripHtml } from "./license.ts";

type WikimediaSearchPage = {
  imageinfo?: WikimediaImageInfo[];
  ns: number;
  pageid: number;
  title: string;
};

type WikimediaImageInfo = {
  descriptionurl?: string;
  extmetadata?: Record<string, { value?: string }>;
  height?: number;
  mime?: string;
  sha1?: string;
  size?: number;
  url?: string;
  width?: number;
};

export type WikimediaCandidate = {
  attributionText: string | null;
  creatorName: string | null;
  description: string;
  fileTitle: string;
  height: number;
  licenseCode: string | null;
  licenseReason: string;
  licenseStatus: "approved" | "rejected" | "needs_clarification";
  licenseUrl: string | null;
  mime: string;
  sha1: string | null;
  size: number;
  sourceFileUrl: string;
  sourcePageUrl: string;
  title: string;
  width: number;
};

function cachePath(key: string) {
  const hash = createHash("sha256").update(key).digest("hex").slice(0, 24);
  return resolve(process.cwd(), "data/media-cache/wikimedia", `${hash}.json`);
}

function readCache<T>(key: string): T | null {
  const path = cachePath(key);

  if (!existsSync(path)) {
    return null;
  }

  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeCache(key: string, data: unknown) {
  const path = cachePath(key);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function assertWikimediaUrl(value: string) {
  const url = new URL(value);
  const allowedHosts = new Set([
    "commons.wikimedia.org",
    "upload.wikimedia.org",
  ]);

  if (!allowedHosts.has(url.hostname)) {
    throw new Error(`URL Wikimedia tidak diizinkan: ${url.hostname}`);
  }
}

async function fetchJson<T>(url: URL, cacheKey: string): Promise<T> {
  const cached = readCache<T>(cacheKey);

  if (cached) {
    return cached;
  }

  const env = loadMediaImportEnv();
  const response = await fetch(url, {
    headers: {
      "User-Agent": env.WIKIMEDIA_USER_AGENT,
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Wikimedia API gagal: HTTP ${response.status}`);
  }

  const data = (await response.json()) as T;
  writeCache(cacheKey, data);
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 750));
  return data;
}

function toCandidate(page: WikimediaSearchPage): WikimediaCandidate | null {
  const info = page.imageinfo?.[0];

  if (!info?.url || !info.descriptionurl) {
    return null;
  }

  assertWikimediaUrl(info.url);
  assertWikimediaUrl(info.descriptionurl);

  const metadata = info.extmetadata ?? {};
  const license = chooseLicense(
    metadata.LicenseShortName?.value,
    metadata.UsageTerms?.value,
    metadata.LicenseUrl?.value,
  );
  const title = stripHtml(metadata.ObjectName?.value) || page.title;
  const creatorName =
    stripHtml(metadata.Artist?.value) ||
    stripHtml(metadata.Credit?.value) ||
    null;
  const sourcePageUrl = info.descriptionurl;
  const attributionText =
    stripHtml(metadata.Attribution?.value) ||
    (creatorName && license.code
      ? `${title} oleh ${creatorName}, ${license.code}, ${sourcePageUrl}`
      : null);

  return {
    attributionText,
    creatorName,
    description: stripHtml(metadata.ImageDescription?.value),
    fileTitle: page.title,
    height: info.height ?? 0,
    licenseCode: license.code,
    licenseReason: license.reason,
    licenseStatus: license.status,
    licenseUrl: license.url,
    mime: info.mime ?? "",
    sha1: info.sha1 ?? null,
    size: info.size ?? 0,
    sourceFileUrl: info.url,
    sourcePageUrl,
    title,
    width: info.width ?? 0,
  };
}

export async function searchWikimediaImages(query: string, limit = 5) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrsearch", `file:${query}`);
  url.searchParams.set("gsrlimit", String(Math.min(limit, 10)));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|mime|sha1|extmetadata");

  const data = await fetchJson<{
    query?: { pages?: Record<string, WikimediaSearchPage> };
  }>(url, `search:${query}:${limit}`);

  const pages = Object.values(data.query?.pages ?? {});

  return pages
    .map(toCandidate)
    .filter((candidate): candidate is WikimediaCandidate => Boolean(candidate));
}
