import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSupabaseConfig } from "../../src/lib/supabase/config";

const envKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
] as const;

const originalEnv = new Map<string, string | undefined>();

function clearSupabaseEnv() {
  for (const key of envKeys) {
    delete process.env[key];
  }
}

describe("Supabase runtime config", () => {
  beforeEach(() => {
    for (const key of envKeys) {
      originalEnv.set(key, process.env[key]);
    }

    clearSupabaseEnv();
  });

  afterEach(() => {
    clearSupabaseEnv();

    for (const [key, value] of originalEnv) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    originalEnv.clear();
  });

  it("menggunakan env publik utama saat tersedia", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public-url.test";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-key";
    process.env.SUPABASE_URL = "https://server-url.test";
    process.env.SUPABASE_ANON_KEY = "server-key";

    expect(getSupabaseConfig()).toEqual({
      publishableKey: "public-key",
      url: "https://public-url.test",
    });
  });

  it("menerima alias anon key dan server URL untuk render publik", () => {
    process.env.SUPABASE_URL = "https://server-url.test";
    process.env.SUPABASE_ANON_KEY = "server-anon-key";

    expect(getSupabaseConfig()).toEqual({
      publishableKey: "server-anon-key",
      url: "https://server-url.test",
    });
  });

  it("menerima NEXT_PUBLIC_SUPABASE_ANON_KEY sebagai alias publishable key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public-url.test";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";

    expect(getSupabaseConfig()).toEqual({
      publishableKey: "public-anon-key",
      url: "https://public-url.test",
    });
  });

  it("mengembalikan null bila URL atau key belum lengkap", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public-url.test";

    expect(getSupabaseConfig()).toBeNull();
  });
});
