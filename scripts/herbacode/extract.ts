import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { inflateRawSync } from "node:zlib";

export const HERBACODE_DOCUMENT_PATH = "herba code.docx";
export const HERBACODE_SOURCE_CODE = "KHB-HERBACODE-2026";
export const HERBACODE_SOURCE_TITLE = "HerbaCode Kampung Herbal Harmony";
export const HERBACODE_DATA_PATH = "data/herbacode/herbacode-data.json";

type ZipEntry = {
  compressionMethod: number;
  compressedSize: number;
  fileName: string;
  localHeaderOffset: number;
};

type FieldKey =
  | "activeCompounds"
  | "benefits"
  | "cultivationTechniques"
  | "localName"
  | "preparationMethods"
  | "scientificName"
  | "usedParts"
  | "warnings";

export type HerbaCodeTitleCorrection = {
  correctedTitle: string;
  occurrence: number;
  rawTitle: string;
  reason: string;
};

export type HerbaCodeZone = {
  displayOrder: number;
  rawTitle: string;
  slug: string;
  title: string;
  titleCorrection: HerbaCodeTitleCorrection | null;
  zoneCode: string;
};

export type HerbaCodeEntry = {
  activeCompounds: string[];
  benefits: string[];
  cultivationTechniques: string[];
  entryKey: string;
  entryOrder: number;
  localName: string;
  plantKey: string;
  plantSlug: string;
  preparationMethods: string[];
  rawEntryTitle: string;
  rawZoneTitle: string;
  scientificName: string | null;
  titleCorrection: HerbaCodeTitleCorrection | null;
  usedParts: string[];
  warnings: string[];
  zoneCode: string;
  zoneSlug: string;
  zoneTitle: string;
};

export type HerbaCodePlant = {
  aliases: string[];
  localName: string;
  plantKey: string;
  scientificName: string | null;
  slug: string;
};

export type HerbaCodeData = {
  corrections: HerbaCodeTitleCorrection[];
  documentPath: string;
  documentSha256: string | null;
  entries: HerbaCodeEntry[];
  sourceCode: string;
  sourceTitle: string;
  uniquePlants: HerbaCodePlant[];
  zones: HerbaCodeZone[];
};

const documentXmlPath = "word/document.xml";

const fieldLabelSource = [
  { key: "activeCompounds", label: "kandungan senyawa aktif" },
  { key: "benefits", label: "manfaat dalam bidang kesehatan" },
  { key: "benefits", label: "manfaat kesehatan" },
  { key: "usedParts", label: "bagian tanaman yang digunakan" },
  { key: "cultivationTechniques", label: "teknik budidaya" },
  { key: "preparationMethods", label: "cara pemanfaatan" },
  { key: "scientificName", label: "nama ilmiah" },
  { key: "localName", label: "nama lokal" },
  { key: "benefits", label: "manfaat" },
  { key: "warnings", label: "perhatian" },
] satisfies Array<{ key: FieldKey; label: string }>;

const fieldLabels = [...fieldLabelSource].sort(
  (left, right) => right.label.length - left.label.length,
);

// Zone title anomalies are detected from content, not from a hardcoded occurrence
// index: different source documents put a different number of zones in a different
// order, so a table keyed by "the 7th zone" would silently mislabel whichever real
// zone happens to land on that position in a differently-shaped document.

function readUInt16(buffer: Buffer, offset: number) {
  return buffer.readUInt16LE(offset);
}

function readUInt32(buffer: Buffer, offset: number) {
  return buffer.readUInt32LE(offset);
}

function findEndOfCentralDirectory(buffer: Buffer) {
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (readUInt32(buffer, offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error("Struktur DOCX tidak valid: EOCD ZIP tidak ditemukan.");
}

function readZipEntries(buffer: Buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const totalEntries = readUInt16(buffer, eocdOffset + 10);
  const centralDirectoryOffset = readUInt32(buffer, eocdOffset + 16);
  const entries: ZipEntry[] = [];
  let offset = centralDirectoryOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    if (readUInt32(buffer, offset) !== 0x02014b50) {
      throw new Error("Struktur DOCX tidak valid: header central directory rusak.");
    }

    const compressionMethod = readUInt16(buffer, offset + 10);
    const compressedSize = readUInt32(buffer, offset + 20);
    const fileNameLength = readUInt16(buffer, offset + 28);
    const extraFieldLength = readUInt16(buffer, offset + 30);
    const fileCommentLength = readUInt16(buffer, offset + 32);
    const localHeaderOffset = readUInt32(buffer, offset + 42);
    const fileName = buffer
      .subarray(offset + 46, offset + 46 + fileNameLength)
      .toString("utf8");

    entries.push({
      compressedSize,
      compressionMethod,
      fileName,
      localHeaderOffset,
    });

    offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function extractZipFile(buffer: Buffer, fileName: string) {
  const entry = readZipEntries(buffer).find((item) => item.fileName === fileName);

  if (!entry) {
    throw new Error(`File ${fileName} tidak ditemukan di dalam DOCX.`);
  }

  const localOffset = entry.localHeaderOffset;

  if (readUInt32(buffer, localOffset) !== 0x04034b50) {
    throw new Error("Struktur DOCX tidak valid: local file header rusak.");
  }

  const localFileNameLength = readUInt16(buffer, localOffset + 26);
  const localExtraFieldLength = readUInt16(buffer, localOffset + 28);
  const dataStart = localOffset + 30 + localFileNameLength + localExtraFieldLength;
  const compressedData = buffer.subarray(
    dataStart,
    dataStart + entry.compressedSize,
  );

  if (entry.compressionMethod === 0) {
    return compressedData;
  }

  if (entry.compressionMethod === 8) {
    return inflateRawSync(compressedData);
  }

  throw new Error(
    `Metode kompresi DOCX tidak didukung: ${entry.compressionMethod}.`,
  );
}

function decodeXml(value: string) {
  return value.replace(/&(#x?[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g, (match, entity) => {
    if (entity === "amp") return "&";
    if (entity === "lt") return "<";
    if (entity === "gt") return ">";
    if (entity === "quot") return '"';
    if (entity === "apos") return "'";

    const valueText = String(entity);
    const codePoint = valueText.startsWith("#x")
      ? Number.parseInt(valueText.slice(2), 16)
      : Number.parseInt(valueText.slice(1), 10);

    return Number.isFinite(codePoint)
      ? String.fromCodePoint(codePoint)
      : match;
  });
}

function extractParagraphs(documentXml: string) {
  const paragraphs: string[] = [];
  const paragraphPattern = /<w:p\b[\s\S]*?<\/w:p>/g;
  const textPattern = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
  const tabPattern = /<w:tab\s*\/>/g;

  for (const paragraphMatch of documentXml.matchAll(paragraphPattern)) {
    const paragraphXml = paragraphMatch[0].replace(tabPattern, " ");
    const textParts = Array.from(paragraphXml.matchAll(textPattern)).map((match) =>
      decodeXml(match[1]),
    );
    const text = textParts.join("").replace(/\s+/g, " ").trim();

    if (text) {
      paragraphs.push(text);
    }
  }

  return paragraphs;
}

function matchFieldLabel(line: string): { inlineValue: string; key: FieldKey } | null {
  const normalizedLine = line.toLowerCase().trim();

  for (const field of fieldLabels) {
    if (normalizedLine === field.label) {
      return { inlineValue: "", key: field.key };
    }

    if (normalizedLine.startsWith(`${field.label} `)) {
      return {
        inlineValue: line.slice(field.label.length).trim(),
        key: field.key,
      };
    }

    if (normalizedLine.startsWith(`${field.label}:`)) {
      return {
        inlineValue: line.slice(field.label.length + 1).trim(),
        key: field.key,
      };
    }

    // A few entries concatenate the label directly onto the value with no
    // separator at all (e.g. "Nama ilmiahCinnamomum burmannii ..."). Only
    // "nama ilmiah"/"nama lokal" are known to do this, so the fallback stays
    // scoped to those two fields to avoid over-matching elsewhere. The colon
    // strip is a safety net in case a colon ever slips through unmatched above.
    if (
      (field.key === "scientificName" || field.key === "localName") &&
      normalizedLine.startsWith(field.label)
    ) {
      return {
        inlineValue: line.slice(field.label.length).trim().replace(/^:\s*/, ""),
        key: field.key,
      };
    }
  }

  return null;
}

export function normalizeHerbaCodeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyHerbaCode(value: string) {
  return normalizeHerbaCodeName(value).replace(/\s+/g, "-");
}

function primaryPlantName(value: string) {
  return value.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function titleCasePlantName(value: string) {
  const preserve = new Set(["dan", "di", "ke", "atau"]);

  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && preserve.has(word.toLowerCase())) {
        return word.toLowerCase();
      }

      if (word === word.toUpperCase() && word.length <= 4) {
        return word;
      }

      return `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function extractAliases(localName: string, rawEntryTitle: string) {
  const aliases = new Set<string>();

  for (const candidate of [
    localName,
    primaryPlantName(localName),
    rawEntryTitle,
    primaryPlantName(rawEntryTitle),
  ]) {
    const trimmed = candidate.trim();

    if (trimmed) {
      aliases.add(trimmed);
    }
  }

  for (const match of localName.matchAll(/\(([^)]+)\)/g)) {
    const alias = match[1]?.trim();

    if (alias) {
      aliases.add(alias);
    }
  }

  return Array.from(aliases);
}

function normalizeList(values: string[] | undefined) {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.replace(/\s+/g, " ").trim())
        .filter(Boolean),
    ),
  );
}

function parseEntryTitle(value: string, fallbackOrder: number) {
  const numbered = value.match(/^([0-9]+)\.\s*(.+)$/);

  if (!numbered) {
    return {
      entryOrder: fallbackOrder,
      rawEntryTitle: value.trim(),
    };
  }

  return {
    entryOrder: Number.parseInt(numbered[1] ?? String(fallbackOrder), 10),
    rawEntryTitle: numbered[2]?.trim() ?? value.trim(),
  };
}

function correctionForZone(
  rawTitle: string,
  occurrence: number,
  previousCleanTitle: string | null,
) {
  const trimmedTitle = rawTitle.trim();

  // Case 1: a stray outline/source number leaked into the title, e.g.
  // "Zona 18 – Anti Mikroba". Stripping it is a mechanical, content-free fix.
  const numberArtifactMatch = trimmedTitle.match(/^(zona)\s+\d+\s*[-–—]?\s*(.+)$/i);

  if (numberArtifactMatch) {
    const correctedTitle = `${numberArtifactMatch[1]} ${numberArtifactMatch[2]}`.trim();
    const correction: HerbaCodeTitleCorrection = {
      correctedTitle,
      occurrence,
      rawTitle: trimmedTitle,
      reason:
        "Nomor sumber pada judul dihapus agar konsisten dengan judul zona lain tanpa mengubah tema.",
    };

    return { correction, title: correctedTitle };
  }

  // Case 2: the title exactly repeats the previous zone's title. This can't be
  // resolved without reading the zone's content (which this parser deliberately
  // does not do, to avoid inventing a semantic replacement), so it's flagged for
  // manual review and mechanically disambiguated so the two zones never collide.
  if (
    previousCleanTitle &&
    normalizeHerbaCodeName(trimmedTitle) === normalizeHerbaCodeName(previousCleanTitle)
  ) {
    const correctedTitle = `${trimmedTitle} (zona ke-${occurrence})`;
    const correction: HerbaCodeTitleCorrection = {
      correctedTitle,
      occurrence,
      rawTitle: trimmedTitle,
      reason:
        "Judul zona ini identik dengan judul zona sebelumnya di dokumen. Ditandai otomatis untuk ditinjau manual; isi tidak dibaca ulang untuk menebak tema yang benar.",
    };

    return { correction, title: correctedTitle };
  }

  return { correction: null, title: trimmedTitle };
}

function buildEntriesForZone(
  paragraphs: string[],
  zoneStart: number,
  zoneEnd: number,
  zone: HerbaCodeZone,
) {
  const localNameIndexes: number[] = [];

  for (let index = zoneStart + 1; index < zoneEnd; index += 1) {
    if (matchFieldLabel(paragraphs[index] ?? "")?.key === "localName") {
      localNameIndexes.push(index);
    }
  }

  // Some zones never use an explicit "Nama lokal" label at all — the entry
  // title doubles as the local name, and only "Nama ilmiah" appears once per
  // entry. Without this fallback, those zones would silently yield zero
  // entries. "Nama ilmiah" is used because it is the one label observed to
  // appear exactly once in every entry across every formatting style in the
  // source document.
  let anchorIndexes = localNameIndexes;

  if (anchorIndexes.length === 0) {
    anchorIndexes = [];

    for (let index = zoneStart + 1; index < zoneEnd; index += 1) {
      if (matchFieldLabel(paragraphs[index] ?? "")?.key === "scientificName") {
        anchorIndexes.push(index);
      }
    }
  }

  return anchorIndexes.map((anchorIndex, index) => {
    const title = parseEntryTitle(paragraphs[anchorIndex - 1] ?? "", index + 1);
    const nextAnchorIndex = anchorIndexes[index + 1];
    const entryEnd =
      nextAnchorIndex === undefined ? zoneEnd - 1 : nextAnchorIndex - 2;
    const sections = new Map<FieldKey, string[]>();
    let currentField: FieldKey | null = null;

    for (let cursor = anchorIndex; cursor <= entryEnd; cursor += 1) {
      const line = paragraphs[cursor] ?? "";
      const label = matchFieldLabel(line);

      if (label) {
        currentField = label.key;

        if (!sections.has(currentField)) {
          sections.set(currentField, []);
        }

        if (label.inlineValue) {
          sections.get(currentField)?.push(label.inlineValue);
        }

        continue;
      }

      if (currentField) {
        sections.get(currentField)?.push(line);
      }
    }

    const localName =
      normalizeList(sections.get("localName"))[0] ?? title.rawEntryTitle;
    const scientificName =
      normalizeList(sections.get("scientificName"))[0] ?? null;
    const plantName = titleCasePlantName(primaryPlantName(title.rawEntryTitle));
    const plantKey = normalizeHerbaCodeName(plantName);
    const plantSlug = slugifyHerbaCode(plantName);
    const entryKey = `${zone.slug}:${plantSlug}`;

    return {
      activeCompounds: normalizeList(sections.get("activeCompounds")),
      benefits: normalizeList(sections.get("benefits")),
      cultivationTechniques: normalizeList(sections.get("cultivationTechniques")),
      entryKey,
      entryOrder: title.entryOrder,
      localName,
      plantKey,
      plantSlug,
      preparationMethods: normalizeList(sections.get("preparationMethods")),
      rawEntryTitle: title.rawEntryTitle,
      rawZoneTitle: zone.rawTitle,
      scientificName,
      titleCorrection: zone.titleCorrection,
      usedParts: normalizeList(sections.get("usedParts")),
      warnings: normalizeList(sections.get("warnings")),
      zoneCode: zone.zoneCode,
      zoneSlug: zone.slug,
      zoneTitle: zone.title,
    } satisfies HerbaCodeEntry;
  });
}

function buildUniquePlants(entries: HerbaCodeEntry[]) {
  const plants = new Map<string, HerbaCodePlant>();

  for (const entry of entries) {
    const existing = plants.get(entry.plantKey);
    const localName = titleCasePlantName(primaryPlantName(entry.rawEntryTitle));
    const aliases = extractAliases(entry.localName, entry.rawEntryTitle);

    if (!existing) {
      plants.set(entry.plantKey, {
        aliases,
        localName,
        plantKey: entry.plantKey,
        scientificName: entry.scientificName,
        slug: entry.plantSlug,
      });
      continue;
    }

    for (const alias of aliases) {
      if (!existing.aliases.includes(alias)) {
        existing.aliases.push(alias);
      }
    }

    if (!existing.scientificName && entry.scientificName) {
      existing.scientificName = entry.scientificName;
    }
  }

  return Array.from(plants.values()).sort((left, right) =>
    left.localName.localeCompare(right.localName, "id"),
  );
}

export function extractHerbaCodeFromParagraphs(
  paragraphs: string[],
  documentPath = HERBACODE_DOCUMENT_PATH,
): HerbaCodeData {
  const zoneStarts = paragraphs
    .map((paragraph, index) => ({ index, paragraph }))
    .filter((item) => item.paragraph.toLowerCase().startsWith("zona"));
  const zones: HerbaCodeZone[] = [];
  const corrections: HerbaCodeTitleCorrection[] = [];
  const entries: HerbaCodeEntry[] = [];
  let previousCleanTitle: string | null = null;

  zoneStarts.forEach((zoneStart, index) => {
    const occurrence = index + 1;
    const { correction, title } = correctionForZone(
      zoneStart.paragraph,
      occurrence,
      previousCleanTitle,
    );
    const slug = slugifyHerbaCode(title.replace(/^zona\s+/i, ""));
    const zone: HerbaCodeZone = {
      displayOrder: occurrence,
      rawTitle: zoneStart.paragraph,
      slug,
      title,
      titleCorrection: correction,
      // Document-position placeholder only. The real, permanent DB zone_code is
      // resolved separately at import time by matching zones against existing
      // production zones by title, never by this occurrence-based value.
      zoneCode: `khb-z${String(occurrence).padStart(2, "0")}`,
    };
    const nextZoneStart = zoneStarts[index + 1]?.index ?? paragraphs.length;

    zones.push(zone);
    previousCleanTitle = title;

    if (correction) {
      corrections.push(correction);
    }

    entries.push(
      ...buildEntriesForZone(paragraphs, zoneStart.index, nextZoneStart, zone),
    );
  });

  return {
    corrections,
    documentPath,
    documentSha256: null,
    entries,
    sourceCode: HERBACODE_SOURCE_CODE,
    sourceTitle: HERBACODE_SOURCE_TITLE,
    uniquePlants: buildUniquePlants(entries),
    zones,
  };
}

// The working copy of the source document is never committed (it changes name
// on every re-export from Word, e.g. "herba code (1).docx", "herba code (2).docx").
// Rather than hardcoding one exact name, look for whichever "herba code*.docx"
// file is actually present. If more than one candidate exists, fail loudly
// instead of silently guessing -- the caller must pass an explicit path
// (the CLI exposes this as --document) rather than have the wrong document
// picked automatically.
export function findHerbaCodeDocumentPath(dir = process.cwd()): string | null {
  let entries: string[];

  try {
    entries = readdirSync(dir);
  } catch {
    return null;
  }

  const candidates = entries.filter((name) =>
    /^herba code(\s*\(\d+\))?\.docx$/i.test(name),
  );

  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length > 1) {
    throw new Error(
      `Ditemukan lebih dari satu file DOCX HerbaCode di direktori proyek: ${candidates.join(", ")}. ` +
        "Tentukan file yang dipakai secara eksplisit dengan flag --document.",
    );
  }

  return candidates[0]!;
}

export function readDocxParagraphs(
  docxPath = findHerbaCodeDocumentPath() ?? HERBACODE_DOCUMENT_PATH,
) {
  const absolutePath = resolve(process.cwd(), docxPath);
  const docx = readFileSync(absolutePath);
  const documentXml = extractZipFile(docx, documentXmlPath).toString("utf8");

  return extractParagraphs(documentXml);
}

export function readFileSha256(
  path = findHerbaCodeDocumentPath() ?? HERBACODE_DOCUMENT_PATH,
) {
  return createHash("sha256")
    .update(readFileSync(resolve(process.cwd(), path)))
    .digest("hex");
}

export function extractHerbaCodeFromDocx(
  docxPath = findHerbaCodeDocumentPath() ?? HERBACODE_DOCUMENT_PATH,
) {
  if (!existsSync(resolve(process.cwd(), docxPath))) {
    return JSON.parse(
      readFileSync(resolve(process.cwd(), HERBACODE_DATA_PATH), "utf8"),
    ) as HerbaCodeData;
  }

  return {
    ...extractHerbaCodeFromParagraphs(readDocxParagraphs(docxPath), docxPath),
    documentSha256: readFileSha256(docxPath),
  };
}

export function writeJsonFile(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
