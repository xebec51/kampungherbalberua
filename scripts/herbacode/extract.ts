import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { inflateRawSync } from "node:zlib";

export const HERBACODE_DOCUMENT_PATH = "herba code.docx";
export const HERBACODE_SOURCE_CODE = "KHB-HERBACODE-2026";
export const HERBACODE_SOURCE_TITLE = "HerbaCode Kampung Herbal Harmony";
export const HERBACODE_DATA_PATH = "data/herbacode/herbacode-data.json";
export const HERBACODE_REPORT_PATH = "data/herbacode/import-report.json";

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

const zoneOverrides: Record<
  number,
  {
    correctedTitle: string;
    reason: string;
  }
> = {
  7: {
    correctedTitle: "Zona Kesehatan Mulut",
    reason:
      "Judul kedua tertulis sama dengan zona sebelumnya, tetapi isi tanaman membahas rongga mulut, gusi, plak, sariawan, dan bau mulut.",
  },
  8: {
    correctedTitle: "Zona Anti Mikroba",
    reason:
      "Nomor sumber pada judul dihapus agar konsisten dengan judul zona lain tanpa mengubah tema.",
  },
  9: {
    correctedTitle: "Zona Kesehatan Perempuan",
    reason:
      "Nomor sumber pada judul dihapus agar konsisten dengan judul zona lain tanpa mengubah tema.",
  },
};

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

    if (
      (field.label === "nama ilmiah" || field.label === "nama lokal") &&
      normalizedLine.startsWith(field.label)
    ) {
      return {
        inlineValue: line.slice(field.label.length).trim(),
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

function correctionForZone(rawTitle: string, occurrence: number) {
  const override = zoneOverrides[occurrence];

  if (!override) {
    return {
      correction: null,
      title: rawTitle,
    };
  }

  const correction: HerbaCodeTitleCorrection = {
    correctedTitle: override.correctedTitle,
    occurrence,
    rawTitle,
    reason: override.reason,
  };

  return {
    correction,
    title: override.correctedTitle,
  };
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

  return localNameIndexes.map((localNameIndex, index) => {
    const title = parseEntryTitle(paragraphs[localNameIndex - 1] ?? "", index + 1);
    const nextLocalNameIndex = localNameIndexes[index + 1];
    const entryEnd =
      nextLocalNameIndex === undefined ? zoneEnd - 1 : nextLocalNameIndex - 2;
    const sections = new Map<FieldKey, string[]>();
    let currentField: FieldKey | null = null;

    for (let cursor = localNameIndex; cursor <= entryEnd; cursor += 1) {
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

  zoneStarts.forEach((zoneStart, index) => {
    const occurrence = index + 1;
    const { correction, title } = correctionForZone(
      zoneStart.paragraph,
      occurrence,
    );
    const slug = slugifyHerbaCode(title.replace(/^zona\s+/i, ""));
    const zone: HerbaCodeZone = {
      displayOrder: occurrence,
      rawTitle: zoneStart.paragraph,
      slug,
      title,
      titleCorrection: correction,
      zoneCode: `khb-z${String(occurrence).padStart(2, "0")}`,
    };
    const nextZoneStart = zoneStarts[index + 1]?.index ?? paragraphs.length;

    zones.push(zone);

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
    entries,
    sourceCode: HERBACODE_SOURCE_CODE,
    sourceTitle: HERBACODE_SOURCE_TITLE,
    uniquePlants: buildUniquePlants(entries),
    zones,
  };
}

export function readDocxParagraphs(docxPath = HERBACODE_DOCUMENT_PATH) {
  const absolutePath = resolve(process.cwd(), docxPath);
  const docx = readFileSync(absolutePath);
  const documentXml = extractZipFile(docx, documentXmlPath).toString("utf8");

  return extractParagraphs(documentXml);
}

export function extractHerbaCodeFromDocx(docxPath = HERBACODE_DOCUMENT_PATH) {
  return extractHerbaCodeFromParagraphs(readDocxParagraphs(docxPath), docxPath);
}

export function writeJsonFile(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
