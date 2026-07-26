import { expect, test } from "@playwright/test";

test("preview deployment public smoke @preview", async ({ page, request }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      exact: true,
      name: "Mengenal Tanaman, Merawat Kesehatan, Memberdayakan Warga",
    }),
  ).toBeVisible();

  await page.goto("/tanaman");
  await expect(page.getByLabel("Cari tanaman")).toBeVisible();

  await page.goto("/zona-kesehatan");
  await expect(
    page.getByRole("link", { exact: true, name: "Jl. Digestia" }),
  ).toBeVisible();

  await page.goto("/zona-kesehatan/digestia");
  await expect(page.getByText("khb-z01", { exact: true })).toBeVisible();

  const qr = await request.get("/z/khb-z01", { maxRedirects: 0 });
  expect(qr.status()).toBe(307);

  await page.goto("/peta");
  await expect(
    page.getByRole("heading", { exact: true, name: "Peta Kampung Herbal" }),
  ).toBeVisible();
  await expect(page.getByText("sembilan zona tematik")).toBeVisible();

  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
});
