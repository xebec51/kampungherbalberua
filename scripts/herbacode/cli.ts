import { createMediaAdminClient } from "../media/lib/supabase-admin.ts";
import { extractHerbaCodeOnly, importHerbaCode } from "./import.ts";

type HerbaCodeCommand = "extract" | "import";

const commands = new Set<HerbaCodeCommand>(["extract", "import"]);

function parseCommand(argv: string[]) {
  const [commandValue = "extract", ...flags] = argv;

  if (!commands.has(commandValue as HerbaCodeCommand)) {
    throw new Error(`Command HerbaCode tidak dikenal: ${commandValue}`);
  }

  return {
    command: commandValue as HerbaCodeCommand,
    dryRun: !flags.includes("--execute"),
    execute: flags.includes("--execute"),
  };
}

async function main() {
  const options = parseCommand(process.argv.slice(2));

  if (options.command === "extract") {
    const summary = extractHerbaCodeOnly();
    console.log(
      `Extract HerbaCode: zona=${summary.zonesImported}, entri=${summary.documentEntryCount}, tanaman_unik=${summary.uniquePlantsInDocument}, koreksi=${summary.corrections.length}`,
    );
    return;
  }

  if (!options.execute) {
    console.log("Mode dry-run aktif. Tidak ada mutasi Supabase.");
  }

  const supabase = createMediaAdminClient();
  const summary = await importHerbaCode(supabase, {
    dryRun: options.dryRun,
  });

  console.log(
    `Import HerbaCode: dry_run=${summary.dryRun}, zona=${summary.zonesImported}, entri=${summary.documentEntryCount}, tanaman_unik=${summary.uniquePlantsInDocument}, cocok=${summary.matchedUniquePlants}, baru=${summary.newPlants}, relasi=${summary.relationCount}, gagal=${summary.failedMappings.length}`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error tidak dikenal";
  console.error(`HerbaCode CLI gagal: ${message}`);
  process.exitCode = 1;
});
