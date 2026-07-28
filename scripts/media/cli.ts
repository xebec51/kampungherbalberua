import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createMediaAdminClient } from "./lib/supabase-admin.ts";
import { loadMediaImportEnv } from "./lib/env.ts";
import {
  importPosterWorkbook,
  validatePosterWorkbook,
} from "./lib/poster.ts";
import { researchPlantImages } from "./lib/research.ts";
import { bootstrapMediaBuckets } from "./lib/storage.ts";
import { uploadApprovedPlantImages } from "./lib/media-files.ts";
import { applyPlantTaxonomy } from "./lib/plant-taxonomy.ts";
import { researchPosterPlantImages } from "./lib/poster-plant-images.ts";
import { migrateZoneImages } from "./lib/zone-migration.ts";

type MediaCommand =
  | "bootstrap"
  | "poster:validate"
  | "poster:import"
  | "taxonomy:plants"
  | "research:plants"
  | "research:poster-plants"
  | "migrate:zones"
  | "import"
  | "report";

type CliOptions = {
  command: MediaCommand;
  dryRun: boolean;
  execute: boolean;
  forceResearch: boolean;
  limit?: number;
  offset?: number;
  only?: string;
  resume: boolean;
};

const COMMANDS = new Set<MediaCommand>([
  "bootstrap",
  "poster:validate",
  "poster:import",
  "taxonomy:plants",
  "research:plants",
  "research:poster-plants",
  "migrate:zones",
  "import",
  "report",
]);

function parseOptions(argv: string[]): CliOptions {
  const [commandValue = "report", ...flags] = argv;

  if (!COMMANDS.has(commandValue as MediaCommand)) {
    throw new Error(`Command media tidak dikenal: ${commandValue}`);
  }

  const options: CliOptions = {
    command: commandValue as MediaCommand,
    dryRun: !flags.includes("--execute"),
    execute: flags.includes("--execute"),
    forceResearch: flags.includes("--force-research"),
    resume: flags.includes("--resume"),
  };

  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];

    if (flag === "--limit" || flag.startsWith("--limit=")) {
      const value = flag.includes("=")
        ? flag.slice(flag.indexOf("=") + 1)
        : flags[index + 1];
      const parsed = Number.parseInt(value ?? "", 10);

      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("--limit wajib berupa angka positif");
      }

      options.limit = parsed;
      index += flag.includes("=") ? 0 : 1;
    }

    if (flag === "--only" || flag.startsWith("--only=")) {
      const value = flag.includes("=")
        ? flag.slice(flag.indexOf("=") + 1)
        : flags[index + 1];

      if (!value) {
        throw new Error("--only wajib memiliki nilai");
      }

      options.only = value;
      index += flag.includes("=") ? 0 : 1;
    }

    if (flag === "--offset" || flag.startsWith("--offset=")) {
      const value = flag.includes("=")
        ? flag.slice(flag.indexOf("=") + 1)
        : flags[index + 1];
      const parsed = Number.parseInt(value ?? "", 10);

      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error("--offset wajib berupa angka non-negatif");
      }

      options.offset = parsed;
      index += flag.includes("=") ? 0 : 1;
    }
  }

  return options;
}

function ensureReportFile(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function assertExecuteAllowed(options: CliOptions) {
  if (!options.execute) {
    return;
  }

  loadMediaImportEnv();
}

async function runBootstrap() {
  const supabase = createMediaAdminClient();
  const summary = await bootstrapMediaBuckets(supabase);
  console.log(
    `Bucket media selesai: created=${summary.created}, verified=${summary.verified}`,
  );
}

async function runPlaceholderCommand(options: CliOptions) {
  assertExecuteAllowed(options);

  const report = {
    command: options.command,
    dryRun: options.dryRun,
    execute: options.execute,
    forceResearch: options.forceResearch,
    limit: options.limit ?? null,
    offset: options.offset ?? null,
    only: options.only ?? null,
    resume: options.resume,
    status: "not_implemented_yet",
  };

  ensureReportFile(`data/media/reports/${options.command.replace(":", "-")}.json`, report);
  console.log(
    `${options.command} belum menjalankan mutasi; report dry-run ditulis.`,
  );
}

async function runPosterValidate() {
  const summary = validatePosterWorkbook();

  console.log(
    `Workbook poster: status=${summary.status}, zona=${summary.zoneCount}, entri=${summary.entryCount}, nama_unik=${summary.uniqueRawNameCount}`,
  );

  if (summary.status !== "valid") {
    throw new Error("Validasi workbook poster gagal");
  }
}

async function runPosterImport(options: CliOptions) {
  assertExecuteAllowed(options);

  if (options.dryRun) {
    loadMediaImportEnv();
  }

  const supabase = createMediaAdminClient();
  const summary = await importPosterWorkbook(supabase, {
    dryRun: options.dryRun,
  });

  console.log(
    `Import poster: dry_run=${summary.dryRun}, source=${summary.sourceRowsUpserted}, koleksi=${summary.collectionCount}, entri=${summary.entryCount}, nama_unik=${summary.uniqueRawNameCount}, matched=${summary.plantsMatched}, unresolved=${summary.unresolvedNames}`,
  );
}

async function runPlantResearch(options: CliOptions) {
  if (options.execute) {
    loadMediaImportEnv();
  }

  const supabase = createMediaAdminClient();
  const summary = await researchPlantImages(supabase, {
    limit: options.limit,
    only: options.only,
  });

  console.log(
    `Riset gambar tanaman: kandidat=${summary.candidates}, approved=${summary.approved}, unresolved=${summary.unresolved}, rejected=${summary.rejected}`,
  );
}

async function runPosterPlantResearch(options: CliOptions) {
  if (options.execute) {
    loadMediaImportEnv();
  }

  const supabase = createMediaAdminClient();
  const summary = await researchPosterPlantImages(supabase, {
    dryRun: options.dryRun,
    limit: options.limit,
    offset: options.offset,
    only: options.only,
  });

  console.log(
    `Riset gambar poster tanaman: unique=${summary.uniquePosterNames}, catalog=${summary.catalogItems}, with_image=${summary.catalogItemsWithImage}, reused=${summary.reusedPlantMedia}, attachments=${summary.attachmentCount}, failures=${summary.failures.length}`,
  );
}

async function runPlantTaxonomy(options: CliOptions) {
  assertExecuteAllowed(options);

  if (options.dryRun) {
    loadMediaImportEnv();
  }

  const supabase = createMediaAdminClient();
  const summary = await applyPlantTaxonomy(supabase, {
    dryRun: options.dryRun,
    limit: options.limit,
  });

  console.log(
    `Taxonomy tanaman: dry_run=${summary.dryRun}, confirmed=${summary.confirmed}, candidate=${summary.candidate}, reused=${summary.existingPlantsReused}, draft=${summary.draftPlantsCreated}, mapped=${summary.sourceEntriesMapped}, unresolved=${summary.unresolved}, failures=${summary.failures.length}`,
  );
}

async function runMediaImport(options: CliOptions) {
  assertExecuteAllowed(options);

  if (options.dryRun) {
    loadMediaImportEnv();
  }

  const supabase = createMediaAdminClient();
  const summary = await uploadApprovedPlantImages(supabase, {
    dryRun: options.dryRun,
    limit: options.limit,
    only: options.only,
  });

  console.log(
    `Import media: original=${summary.originalUploaded}, public=${summary.publicUploaded}, assets=${summary.mediaAssetsInserted}, attachments=${summary.plantAttachments}, reused=${summary.duplicateFilesReused}, rejected=${summary.rejected}`,
  );
}

async function runZoneMigration(options: CliOptions) {
  assertExecuteAllowed(options);

  if (options.dryRun) {
    loadMediaImportEnv();
  }

  const supabase = createMediaAdminClient();
  const summary = await migrateZoneImages(supabase, {
    dryRun: options.dryRun,
    limit: options.limit,
    only: options.only,
  });

  console.log(
    `Migrasi zona: dry_run=${summary.dryRun}, zona=${summary.zonesConsidered}, original=${summary.originalUploaded}, public=${summary.publicUploaded}, attachments=${summary.zoneAttachments}, failures=${summary.failures.length}`,
  );
}

async function main() {
  const options = parseOptions(process.argv.slice(2));

  if (options.command !== "bootstrap" && options.execute && options.dryRun) {
    throw new Error("Gunakan salah satu dari --dry-run atau --execute");
  }

  if (
    options.command !== "bootstrap" &&
    options.command !== "poster:validate" &&
    !options.execute
  ) {
    console.log("Mode dry-run aktif. Tidak ada upload atau mutasi remote.");
  }

  if (options.command === "bootstrap") {
    await runBootstrap();
    return;
  }

  if (options.command === "poster:validate") {
    await runPosterValidate();
    return;
  }

  if (options.command === "poster:import") {
    await runPosterImport(options);
    return;
  }

  if (options.command === "taxonomy:plants") {
    await runPlantTaxonomy(options);
    return;
  }

  if (options.command === "research:plants") {
    await runPlantResearch(options);
    return;
  }

  if (options.command === "research:poster-plants") {
    await runPosterPlantResearch(options);
    return;
  }

  if (options.command === "migrate:zones") {
    await runZoneMigration(options);
    return;
  }

  if (options.command === "import") {
    await runMediaImport(options);
    return;
  }

  if (options.command === "report") {
    const envExists = existsSync(resolve(process.cwd(), ".env.media-import.local"));
    console.log(
      `Media report tersedia untuk lingkungan lokal: env=${envExists ? "ada" : "belum ada"}`,
    );
    return;
  }

  await runPlaceholderCommand(options);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error tidak dikenal";
  console.error(`Media CLI gagal: ${message}`);
  process.exitCode = 1;
});
