import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasOverflow).toBe(false);
}

async function expectNoPublicPlaceholderText(page: Page) {
  const bodyText = await page.locator("body").innerText();

  expect(bodyText).not.toMatch(
    /lorem|placeholder|gambar sementara|visual sementara|media sedang|foto .*menyusul|dokumentasi awal|data demonstrasi|data contoh|sedang disusun|belum aktif|belum menyimpan|undefined|null/i,
  );
}

test("beranda menampilkan ringkasan HerbaCode tanpa placeholder publik", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Kampung Herbal Harmony Berua" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Data tanaman dan zona dari dokumen HerbaCode",
    }),
  ).toBeVisible();
  await expect(page.getByText("Relasi tanaman-zona")).toBeVisible();
  await expect(page.getByText("95")).toBeVisible();
  await expectNoPublicPlaceholderText(page);
  await expectNoHorizontalOverflow(page);
});

test("desktop dan mobile navbar tetap accessible dengan struktur publik", async ({
  page,
}) => {
  await page.setViewportSize({ height: 800, width: 1280 });
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Navigasi utama" });
  await expect(nav.getByRole("link", { exact: true, name: "Beranda" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Edukasi" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Informasi Kampung" })).toBeVisible();
  await expect(nav.getByRole("link", { exact: true, name: "Produk" })).toHaveCount(0);
  await expect(nav.getByRole("link", { exact: true, name: "Kotak Saran" })).toHaveCount(0);

  const edukasiButton = nav.getByRole("button", { name: "Edukasi" });
  const edukasiMenuId = await edukasiButton.getAttribute("aria-controls");
  expect(edukasiMenuId).toBeTruthy();
  await edukasiButton.focus();
  await page.keyboard.press("Enter");
  await expect(edukasiButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(`[id="${edukasiMenuId}"]`)).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Tanaman TOGA" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Zona Kesehatan" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Ramuan Sehat" })).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(edukasiButton).toHaveAttribute("aria-expanded", "false");

  await page.setViewportSize({ height: 812, width: 375 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: /menu navigasi/ });
  await menuButton.click();
  const mobileNav = page.getByRole("navigation", { name: "Navigasi mobile" });
  await expect(mobileNav.getByRole("link", { name: "Tanaman TOGA" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Zona Kesehatan" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Ramuan Sehat" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("katalog tanaman HerbaCode dapat dicari dan tidak menggandakan tanaman berulang", async ({
  page,
}) => {
  await page.goto("/tanaman");

  await expect(
    page.getByRole("heading", {
      name: "Katalog Tanaman Kampung Herbal Harmony",
    }),
  ).toBeVisible();
  await expect(page.getByText("Menampilkan 50 dari 50 tanaman.")).toBeVisible();
  await expect(page.getByRole("link", { exact: true, name: "Jahe" })).toBeVisible();
  await expect(page.getByRole("link", { exact: true, name: "Meniran" })).toBeVisible();

  await page.getByLabel("Cari tanaman").fill("jahe");
  await expect(page.getByText("Menampilkan 1 dari 50 tanaman.")).toBeVisible();
  await expect(page.getByRole("link", { exact: true, name: "Jahe" })).toHaveCount(1);

  await page.getByLabel("Cari tanaman").fill("");
  await page.getByLabel("Filter zona").selectOption("Zona Jantung Sehat");
  await expect(page.getByText(/Menampilkan 10 dari 50 tanaman\./)).toBeVisible();
  await expect(page.getByRole("link", { exact: true, name: "Seledri" })).toBeVisible();
  await expectNoPublicPlaceholderText(page);
});

test("detail tanaman menampilkan HerbaCode dan manfaat tetap terpisah per zona", async ({
  page,
}) => {
  await page.goto("/tanaman/jahe");

  await expect(page.getByRole("heading", { name: "Jahe" })).toBeVisible();
  await expect(page.getByText("Zingiber officinale Roscoe")).toBeVisible();
  await expect(page.getByRole("link", { name: "Zona Pencernaan Sehat" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Zona Tulang & Sendi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Senyawa aktif" })).toBeVisible();
  await expect(page.getByText("Gingerol")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manfaat per zona" })).toBeVisible();
  await expect(page.getByText("Membantu meredakan mual dan muntah.")).toBeVisible();
  await expect(page.getByText("Membantu meredakan nyeri dan kekakuan sendi.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cara pemanfaatan" })).toHaveCount(0);
  await expect(page.getByText("HerbaCode Kampung Herbal Harmony", { exact: true }).first()).toBeVisible();
  await expectNoPublicPlaceholderText(page);

  await page.goto("/tanaman/jintan-hitam");
  await expect(page.getByRole("heading", { name: "Cara pemanfaatan" })).toBeVisible();
  await expect(page.getByText("Dikonsumsi dalam bentuk biji, minyak")).toBeVisible();
});

test("detail zona menampilkan relasi tanaman-zona HerbaCode", async ({ page }) => {
  await page.goto("/zona-kesehatan/imunitas-kuat");

  await expect(page.getByRole("heading", { name: "Zona Imunitas Kuat" })).toBeVisible();
  await expect(page.getByText("khb-z01", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tanaman pada zona ini" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Meniran" })).toBeVisible();
  await expect(page.getByText("Phyllanthin", { exact: true })).toBeVisible();
  await expect(page.getByText("Membantu meningkatkan sistem imun tubuh.")).toBeVisible();
  await expect(page.getByText("HerbaCode Kampung Herbal Harmony", { exact: true }).first()).toBeVisible();
  await expectNoPublicPlaceholderText(page);
});

test("halaman publik utama bebas placeholder, undefined, dan null", async ({
  page,
}) => {
  const routes = [
    "/",
    "/tanaman",
    "/tanaman/jahe",
    "/zona-kesehatan",
    "/zona-kesehatan/imunitas-kuat",
    "/peta",
    "/sumber-gambar",
    "/kotak-saran",
    "/produk",
    "/ramuan",
    "/kegiatan",
    "/wisata",
  ];

  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expectNoPublicPlaceholderText(page);
    await expectNoHorizontalOverflow(page);
  }
});

test("sitemap dan robots memakai route HerbaCode tanpa route QR", async ({
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("/tanaman/jahe");
  expect(sitemapText).toContain("/zona-kesehatan/imunitas-kuat");
  expect(sitemapText).not.toContain("/z/khb-z01");
  expect(sitemapText).not.toContain("/tanaman/willow-bark");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  await expect(robots.text()).resolves.toContain("sitemap");
});
