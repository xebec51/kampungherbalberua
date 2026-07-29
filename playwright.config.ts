import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const isCI = Boolean(process.env.CI);
const parsedBaseURL = new URL(baseURL);
const webServerHost = parsedBaseURL.hostname || "127.0.0.1";
const webServerPort = parsedBaseURL.port || "3000";
const defaultWebServerCommand =
  process.platform === "win32"
    ? `node_modules\\.bin\\next.cmd dev --hostname ${webServerHost} --port ${webServerPort}`
    : `npm run dev -- --hostname ${webServerHost} --port ${webServerPort}`;
const webServerCommand =
  process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? defaultWebServerCommand;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
const vercelAutomationBypassSecret =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
const extraHTTPHeaders = vercelAutomationBypassSecret
  ? { "x-vercel-protection-bypass": vercelAutomationBypassSecret }
  : undefined;
const webServerEnv: Record<string, string> = {
  NEXT_PUBLIC_SITE_URL: baseURL,
};

if (supabasePublishableKey) {
  webServerEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = supabasePublishableKey;
}

if (supabaseUrl) {
  webServerEnv.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
}

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  retries: isCI ? 1 : 0,
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: {
    baseURL,
    extraHTTPHeaders,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: webServerCommand,
        env: webServerEnv,
        reuseExistingServer: !isCI,
        timeout: 120_000,
        url: baseURL,
      },
  workers: isCI ? 1 : 1,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
