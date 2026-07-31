import { createMediaAdminClient } from "../media/lib/supabase-admin.ts";
import { extractHerbaCodeOnly, importHerbaCode } from "./import.ts";

type HerbaCodeCommand = "extract" | "import";

const commands = new Set<HerbaCodeCommand>(["extract", "import"]);

function parseCommand(argv: string[]) {
  const [commandValue = "extract", ...rest] = argv;

  if (!commands.has(commandValue as HerbaCodeCommand)) {
    throw new Error(`Command HerbaCode tidak dikenal: ${commandValue}`);
  }

  const documentFlagIndex = rest.indexOf("--document");
  let documentPath: string | undefined;
  let flags = rest;

  if (documentFlagIndex !== -1) {
    documentPath = rest[documentFlagIndex + 1];

    if (!documentPath) {
      throw new Error("Flag --document membutuhkan path file DOCX.");
    }

    flags = [
      ...rest.slice(0, documentFlagIndex),
      ...rest.slice(documentFlagIndex + 2),
    ];
  }

  return {
    command: commandValue as HerbaCodeCommand,
    documentPath,
    dryRun: !flags.includes("--execute"),
    execute: flags.includes("--execute"),
  };
}

async function main() {
  const options = parseCommand(process.argv.slice(2));

  if (options.command === "extract") {
    const summary = extractHerbaCodeOnly(options.documentPath);
    console.log(
      `Extract HerbaCode: zona=${summary.zonesImported}, entri=${summary.documentEntryCount}, tanaman_unik=${summary.uniquePlantsInDocument}, koreksi=${summary.corrections.length}`,
    );
    return;
  }

  if (!options.execute) {
    console.log("Mode dry-run aktif. Tidak ada mutasi Supabase.");
  }

  const supabase = createMediaAdminClient();
  const report = await importHerbaCode(supabase, {
    documentPath: options.documentPath,
    dryRun: options.dryRun,
  });

  console.log(
    `Import HerbaCode: dry_run=${report.dryRun}, dokumen=${report.documentPath ?? "(data tersimpan)"}, ` +
      `zona=${report.countsAfter.zones} (baru=${report.zones.newlyAssigned.length}, dipertahankan=${report.zones.retained.length}), ` +
      `tanaman=${report.countsAfter.plants} (baru=${report.plants.newCount}, diperbarui=${report.plants.updatedCount}, dipertahankan_tanpa_dokumen=${report.plants.retainedNotInDocument.length}), ` +
      `relasi=${report.countsAfter.entries} (dibuat=${report.relations.createdCount}, diperbarui=${report.relations.updatedCount}, dipertahankan_tanpa_dokumen=${report.relations.retainedNotInDocument.length}), ` +
      `ambiguous=${report.mapping.ambiguous.length}, unresolved=${report.mapping.unresolved.length}`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error tidak dikenal";
  console.error(`HerbaCode CLI gagal: ${message}`);
  process.exitCode = 1;
});
