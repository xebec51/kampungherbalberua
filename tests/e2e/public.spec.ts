import { expect, test } from "@playwright/test";

test("beranda menampilkan heading utama dan zona featured", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Mengenal Tanaman, Merawat Kesehatan, Memberdayakan Warga",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jelajahi Zona Kesehatan" })).toBeVisible();
  await expect(
    page.getByRole("link", { exact: true, name: "Jl. Digestia" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Foto papan Jl. Digestia Zona Pencernaan Sehat",
    }),
  ).toBeVisible();
});

test("katalog tanaman tampil, pencarian bekerja, dan detail jahe dapat dibuka", async ({
  page,
}) => {
  await page.goto("/tanaman");
  await expect(page.getByRole("heading", { name: "Tanaman TOGA Kampung Herbal Berua" })).toBeVisible();
  await page.getByLabel("Cari tanaman").fill("jahe");
  await expect(page.getByText("Menampilkan 1 hasil tanaman.")).toBeVisible();
  await page.getByRole("link", { name: "Jahe", exact: true }).click();
  await expect(page).toHaveURL(/\/tanaman\/jahe$/);
  await expect(page.getByRole("heading", { name: "Jahe" })).toBeVisible();
});

test("zona kesehatan menampilkan sembilan zona, blok, dan disclaimer", async ({ page }) => {
  await page.goto("/zona-kesehatan");
  await expect(
    page.getByRole("link", { exact: true, name: "Jl. Digestia" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { exact: true, name: "Jl. Pediatria" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /^Foto papan Jl\./ })).toHaveCount(9);
  await expect(page.getByText("Blok E1-10, H1-5")).toBeVisible();
  await expect(page.getByText("bukan diagnosis, resep, atau pengganti konsultasi")).toBeVisible();
});

test("peta menampilkan sembilan jalan dan placeholder PWK", async ({ page }) => {
  await page.goto("/peta");
  await expect(page.getByText("sembilan zona tematik")).toBeVisible();
  await expect(
    page.getByText(
      "Pemetaan sedang disusun bersama tim Perencanaan Wilayah dan Kota",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("Jl. Digestia - Zona Pencernaan Sehat")).toBeVisible();
});

test("produk menyediakan tautan pemesanan WhatsApp publik", async ({ page }) => {
  await page.goto("/produk");

  const productCard = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      exact: true,
      name: "Bibit Tanaman TOGA",
    }),
  });
  await expect(productCard.getByRole("link", { name: "Pesan via WhatsApp" })).toHaveAttribute(
    "href",
    /https:\/\/wa\.me\/6289623080501\?text=/,
  );

  await productCard.getByRole("link", { name: "Detail produk" }).click();
  await expect(page).toHaveURL(/\/produk\/bibit-tanaman-toga$/);
  await expect(page.getByRole("heading", { name: "Bibit Tanaman TOGA" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pesan via WhatsApp" })).toHaveAttribute(
    "href",
    /Bibit%20Tanaman%20TOGA/,
  );
});

test("sitemap dan robots dapat diakses dengan canonical zona tanpa route QR", async ({
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("/zona-kesehatan/digestia");
  expect(sitemapText).not.toContain("/z/khb-z01");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  await expect(robots.text()).resolves.toContain("sitemap");
});
