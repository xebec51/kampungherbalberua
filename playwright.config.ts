import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const isCI = Boolean(process.env.CI);

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
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
        env: {
          NEXT_PUBLIC_SITE_URL: baseURL,
        },
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
