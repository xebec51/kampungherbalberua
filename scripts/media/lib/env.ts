import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const MEDIA_PROJECT_REF = "xkvgpauprhggykaxffkh";
export const MEDIA_SUPABASE_URL =
  "https://xkvgpauprhggykaxffkh.supabase.co";

export type MediaImportEnv = {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  SUPABASE_PROJECT_REF: string;
  MEDIA_IMPORT_TARGET: "remote";
  WIKIMEDIA_USER_AGENT: string;
};

const REQUIRED_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_PROJECT_REF",
  "MEDIA_IMPORT_TARGET",
  "WIKIMEDIA_USER_AGENT",
] as const;

function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) {
    throw new Error(`File environment media tidak ditemukan: ${path}`);
  }

  const values: Record<string, string> = {};
  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
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

function assertNoPublicSecret(values: Record<string, string>) {
  const publicSecretKey = Object.keys(values).find(
    (key) =>
      key.startsWith("NEXT_PUBLIC_") && /(SECRET|SERVICE|PRIVATE|KEY)/i.test(key),
  );

  if (publicSecretKey) {
    throw new Error(
      `Environment media tidak boleh memakai key publik untuk secret: ${publicSecretKey}`,
    );
  }
}

export function loadMediaImportEnv(
  envPath = ".env.media-import.local",
): MediaImportEnv {
  const values = parseEnvFile(resolve(process.cwd(), envPath));
  assertNoPublicSecret(values);

  for (const key of REQUIRED_KEYS) {
    if (!values[key]) {
      throw new Error(`Environment media belum lengkap: ${key}`);
    }
  }

  if (values.SUPABASE_URL !== MEDIA_SUPABASE_URL) {
    throw new Error("SUPABASE_URL tidak cocok dengan project media yang diizinkan");
  }

  if (values.SUPABASE_PROJECT_REF !== MEDIA_PROJECT_REF) {
    throw new Error("SUPABASE_PROJECT_REF tidak cocok dengan project media yang diizinkan");
  }

  if (values.MEDIA_IMPORT_TARGET !== "remote") {
    throw new Error("MEDIA_IMPORT_TARGET wajib bernilai remote");
  }

  return {
    SUPABASE_URL: values.SUPABASE_URL,
    SUPABASE_SECRET_KEY: values.SUPABASE_SECRET_KEY,
    SUPABASE_PROJECT_REF: values.SUPABASE_PROJECT_REF,
    MEDIA_IMPORT_TARGET: "remote",
    WIKIMEDIA_USER_AGENT: values.WIKIMEDIA_USER_AGENT,
  };
}

export function redactSecret(value: string): string {
  if (!value) {
    return "[kosong]";
  }

  return "[dirahasiakan]";
}
