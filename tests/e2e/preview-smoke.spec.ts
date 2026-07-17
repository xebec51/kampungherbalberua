import { expect, test } from "@playwright/test";

test("preview deployment public smoke", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByText("Kampung Herbal Berua")).toBeVisible();

  await page.goto("/tanaman");
  await expect(page.getByLabel("Cari tanaman")).toBeVisible();

  await page.goto("/zona-kesehatan");
  await expect(page.getByText("Jl. Digestia")).toBeVisible();

  await page.goto("/zona-kesehatan/digestia");
  await expect(page.getByText("khb-z01")).toBeVisible();

  const qr = await request.get("/z/khb-z01", { maxRedirects: 0 });
  expect(qr.status()).toBe(307);

  await page.goto("/peta");
  await expect(page.getByText("sembilan zona tematik")).toBeVisible();

  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
});
