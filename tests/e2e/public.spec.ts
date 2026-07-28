import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasOverflow).toBe(false);
}

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

test("desktop navbar menampilkan struktur ringkas dan dropdown accessible", async ({
  page,
}) => {
  await page.setViewportSize({ height: 800, width: 1280 });
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Navigasi utama" });
  await expect(nav.getByRole("link", { exact: true, name: "Beranda" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Edukasi" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Informasi Kampung" })).toBeVisible();
  await expect(nav.getByRole("link", { exact: true, name: "Produk" })).toBeVisible();
  await expect(nav.getByRole("link", { exact: true, name: "Kotak Saran" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Tanaman TOGA" })).toHaveCount(0);

  const edukasiButton = nav.getByRole("button", { name: "Edukasi" });
  const edukasiMenuId = await edukasiButton.getAttribute("aria-controls");
  expect(edukasiMenuId).toBeTruthy();
  await expect(edukasiButton).toHaveAttribute("aria-expanded", "false");

  await edukasiButton.focus();
  await page.keyboard.press("Enter");
  await expect(edukasiButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(`[id="${edukasiMenuId}"]`)).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Tanaman TOGA" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Ramuan Sehat" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Zona Kesehatan" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(edukasiButton).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(`[id="${edukasiMenuId}"]`)).toBeHidden();

  await edukasiButton.click();
  await page.getByRole("heading", {
    name: "Mengenal Tanaman, Merawat Kesehatan, Memberdayakan Warga",
  }).click();
  await expect(edukasiButton).toHaveAttribute("aria-expanded", "false");

  await edukasiButton.click();
  const informasiButton = nav.getByRole("button", { name: "Informasi Kampung" });
  await informasiButton.click();
  await expect(edukasiButton).toHaveAttribute("aria-expanded", "false");
  await expect(informasiButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("menuitem", { name: "Tentang" })).toBeVisible();

  await page.keyboard.press("Escape");
  await edukasiButton.click();
  await page.getByRole("menuitem", { name: "Tanaman TOGA" }).click();
  await expect(page).toHaveURL(/\/tanaman$/);
  await expect(nav.getByRole("button", { name: "Edukasi" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("mobile navbar menampilkan semua grup dan menutup setelah dipilih", async ({
  page,
}) => {
  await page.setViewportSize({ height: 812, width: 375 });
  await page.goto("/");

  await expectNoHorizontalOverflow(page);
  const menuButton = page.getByRole("button", { name: /menu navigasi/ });
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");

  const mobileNav = page.getByRole("navigation", { name: "Navigasi mobile" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByText("Edukasi", { exact: true })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Tanaman TOGA" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Ramuan Sehat" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Zona Kesehatan" })).toBeVisible();
  await expect(mobileNav.getByText("Informasi Kampung", { exact: true })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Tentang" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Peta Kampung" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Kegiatan" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Kinerja RT" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Produk" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Kotak Saran" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(mobileNav).toBeHidden();

  await menuButton.click();
  await page
    .getByRole("navigation", { name: "Navigasi mobile" })
    .getByRole("link", { name: "Tanaman TOGA" })
    .click();
  await expect(page).toHaveURL(/\/tanaman$/);
  await expect(page.getByRole("navigation", { name: "Navigasi mobile" })).toBeHidden();
  await expectNoHorizontalOverflow(page);
});

test("desktop navbar tetap muat tanpa horizontal overflow", async ({ page }) => {
  const viewports = [
    { height: 768, width: 1024 },
    { height: 800, width: 1280 },
    { height: 900, width: 1440 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test("katalog tanaman tampil, pencarian bekerja, dan detail jahe dapat dibuka", async ({
  page,
}) => {
  await page.goto("/tanaman");
  await expect(page.getByRole("heading", { name: "Tanaman TOGA Kampung Herbal Berua" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Tanaman Jahe" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Tanaman Jahe" })).toHaveAttribute(
    "src",
    /supabase\.co|storage/,
  );
  await page.getByLabel("Cari tanaman").fill("jahe");
  await expect(page.getByText("Menampilkan 1 hasil tanaman.")).toBeVisible();
  await page.getByRole("link", { name: "Jahe", exact: true }).click();
  await expect(page).toHaveURL(/\/tanaman\/jahe$/);
  await expect(page.getByRole("heading", { name: "Jahe" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Tanaman Jahe" })).toBeVisible();
});

test("gambar tanaman tampil pada beranda dan halaman detail tanaman", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: /^Tanaman / }).first()).toBeVisible();

  const detailPages = [
    { alt: "Tanaman Jahe", slug: "jahe" },
    { alt: "Tanaman Serai", slug: "serai" },
    { alt: "Tanaman Daun Sirih", slug: "daun-sirih" },
    { alt: "Tanaman Bunga Telang", slug: "bunga-telang" },
  ];

  for (const detailPage of detailPages) {
    await page.goto(`/tanaman/${detailPage.slug}`);
    const image = page.getByRole("img", { name: detailPage.alt });
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", /supabase\.co|storage/);
  }
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

test("halaman sumber gambar dapat dibuka tanpa data privat", async ({ page }) => {
  await page.goto("/sumber-gambar");
  await expect(
    page.getByRole("heading", { exact: true, name: "Sumber Gambar" }),
  ).toBeVisible();
  await expect(page.getByText("Atribusi Media")).toBeVisible();
  await expect(page.getByText("original private")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("sitemap dan robots dapat diakses dengan canonical zona tanpa route QR", async ({
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("/zona-kesehatan/digestia");
  expect(sitemapText).toContain("/sumber-gambar");
  expect(sitemapText).not.toContain("/z/khb-z01");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  await expect(robots.text()).resolves.toContain("sitemap");
});
