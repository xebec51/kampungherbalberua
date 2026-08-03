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
      name: "Kampung Herbal Harmony Berua",
    }),
  ).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Navigasi utama" });
  await expect(nav.getByRole("link", { exact: true, name: "Beranda" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Edukasi" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Jelajahi" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Layanan Warga" })).toBeVisible();
  await expect(nav.getByRole("link", { exact: true, name: "Tentang" })).toBeVisible();
  await nav.getByRole("button", { name: "Edukasi" }).click();
  await expect(page.getByRole("menuitem", { name: "Tanaman TOGA" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Zona Kesehatan" })).toBeVisible();
  await page.keyboard.press("Escape");
  await nav.getByRole("button", { name: "Jelajahi" }).click();
  await expect(page.getByRole("menuitem", { name: "Peta Kampung" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Jalan Tematik" })).toBeVisible();
  await page.keyboard.press("Escape");
  await nav.getByRole("button", { name: "Layanan Warga" }).click();
  await expect(page.getByRole("menuitem", { name: "Produk Warga" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/tanaman");
  await expect(page.getByRole("button", { name: /Atur filter/ })).toBeVisible();
  await page.getByRole("button", { name: /Atur filter/ }).click();
  await expect(page.getByLabel("Cari tanaman")).toBeVisible();

  await page.goto("/zona-kesehatan");
  await expect(
    page.getByRole("link", { exact: true, name: "Zona Imunitas Kuat" }),
  ).toBeVisible();

  await page.goto("/zona-kesehatan/imunitas-kuat");
  await expect(page.getByText("Zona HerbaCode", { exact: true }).first()).toBeVisible();

  await page.goto("/jalan");
  await expect(
    page.getByRole("heading", { exact: true, name: "Jalan Tematik Kampung Herbal" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Papan tanaman di Jl. Imun" }),
  ).toBeVisible();

  const qr = await request.get("/z/khb-z01", { maxRedirects: 0 });
  expect(qr.status()).toBe(307);

  await page.goto("/peta");
  await expect(
    page.getByRole("heading", { exact: true, name: "Peta Kampung Herbal" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      exact: true,
      name: "Lokasi Kampung Herbal Harmony Berua",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      exact: true,
      name: "Peta Kompleks Kampung Herbal",
    }),
  ).toBeVisible();
  await expect(page.getByText("Denah Kompleks", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Jalan tematik", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Zona kesehatan", { exact: true }).first()).toBeVisible();

  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
});
