const maxAttempts = 30;
const retryDelayMs = 2_000;

function requiredEnv(name: "SUPABASE_URL" | "SUPABASE_ANON_KEY") {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} wajib diatur dari Supabase lokal.`);
  }

  return value.trim();
}

function assertLocalSupabaseUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const allowedHosts = new Set(["localhost", "127.0.0.1"]);

  if (url.hostname.endsWith("supabase.co") || !allowedHosts.has(url.hostname)) {
    throw new Error("Readiness check hanya boleh memakai Supabase lokal.");
  }

  return url;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function requestSupabase(url: URL, anonKey: string, path: string) {
  return fetch(new URL(path, url), {
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
    },
  });
}

async function isReady(url: URL, anonKey: string) {
  const auth = await requestSupabase(url, anonKey, "/auth/v1/settings");

  if (!auth.ok) {
    return false;
  }

  const data = await requestSupabase(
    url,
    anonKey,
    "/rest/v1/plants?select=id&limit=1",
  );

  return data.ok;
}

async function main() {
  const supabaseUrl = assertLocalSupabaseUrl(requiredEnv("SUPABASE_URL"));
  const anonKey = requiredEnv("SUPABASE_ANON_KEY");

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      if (await isReady(supabaseUrl, anonKey)) {
        console.log("Supabase lokal siap untuk test.");
        return;
      }
    } catch {
      // Retry until the local stack has finished starting all services.
    }

    await delay(retryDelayMs);
  }

  throw new Error("Supabase lokal belum siap setelah 60 detik.");
}

await main();

export {};
