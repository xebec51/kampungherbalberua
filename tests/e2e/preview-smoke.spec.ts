import { expect, test, type Page } from "@playwright/test";

async function expectPreviewIsAccessible(page: Page) {
  const loginHeading = page.getByRole("heading", {
    exact: true,
    name: "Log in to Vercel",
  });

  if (await loginHeading.isVisible({ timeout: 1_000 }).catch(() => false)) {
    throw new Error(
      "Preview deployment dilindungi Vercel. Atur VERCEL_AUTOMATION_BYPASS_SECRET sebagai GitHub Actions secret.",
    );
  }
}

test("preview deployment public smoke @preview", async ({ page, request }) => {
  await page.goto("/");
  await expectPreviewIsAccessible(page);
  await expect(
    page.getByRole("heading", {
      exact: true,
      name: "Mengenal Tanaman, Merawat Kesehatan, Memberdayakan Warga",
    }),
  ).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Navigasi utama" });
  await expect(nav.getByRole("link", { exact: true, name: "Beranda" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Edukasi" })).toBeVisible();
  await expect(nav.getByRole("link", { exact: true, name: "Produk" })).toBeVisible();
  await expect(nav.getByRole("link", { exact: true, name: "Kotak Saran" })).toBeVisible();
  await nav.getByRole("button", { name: "Edukasi" }).click();
  await expect(page.getByRole("menuitem", { name: "Tanaman TOGA" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/tanaman");
  await expect(page.getByLabel("Cari tanaman")).toBeVisible();

  await page.goto("/zona-kesehatan");
  await expect(
    page.getByRole("link", { exact: true, name: "Jl. Digestia" }),
  ).toBeVisible();

  await page.goto("/zona-kesehatan/digestia");
  await expect(page.getByText("khb-z01", { exact: true })).toBeVisible();

  await page.goto("/sumber-gambar");
  await expect(
    page.getByRole("heading", { exact: true, name: "Sumber Gambar" }),
  ).toBeVisible();

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
