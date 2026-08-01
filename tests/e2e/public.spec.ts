import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasOverflow).toBe(false);
}

async function expectNoBrokenImages(page: Page) {
  const brokenImages = await page
    .locator("img")
    .evaluateAll((images) =>
      images
        .filter(
          (image) =>
            image instanceof HTMLImageElement &&
            image.complete &&
            image.naturalWidth === 0,
        )
        .map((image) => image.getAttribute("alt") ?? image.getAttribute("src")),
    );

  expect(brokenImages).toEqual([]);
}

async function expectNoPublicPlaceholderText(page: Page) {
  const bodyText = await page.locator("body").innerText();

  expect(bodyText).not.toMatch(
    /lorem|placeholder|gambar sementara|visual sementara|media sedang|foto .*menyusul|dokumentasi awal|data demonstrasi|data contoh|sedang disusun|belum aktif|belum menyimpan|undefined|null/i,
  );
  expect(bodyText).not.toMatch(/\bkhb-z\d{2}\b/i);
  await expect(
    page.locator(
      '.image-placeholder:not([data-placeholder-variant="plant"])',
    ),
  ).toHaveCount(0);
}

async function expectNoUndefinedOrNull(page: Page) {
  const bodyText = await page.locator("body").innerText();

  expect(bodyText).not.toMatch(/undefined|null/i);
}

test("beranda menampilkan ringkasan HerbaCode tanpa placeholder publik", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Kampung Herbal Harmony Berua" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Kampung Herbal Harmony Berua");
  await expect(
    page.locator('main img[alt="Logo Kampung Herbal Harmony Berua"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('meta[name="description"]'),
  ).toHaveAttribute(
    "content",
    /Portal resmi Kampung Herbal Harmony Berua RT 009\/RW 006/,
  );
  await expect
    .poll(() => page.locator('script[type="application/ld+json"]').textContent())
    .toContain("Kampung Herbal Harmony Berua");
  await expect(
    page.getByRole("heading", {
      name: "Data tanaman dan zona dari dokumen HerbaCode",
    }),
  ).toBeVisible();
  await expect(page.getByText("Relasi tanaman-zona")).toBeVisible();
  await expect(page.getByText("205")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Logo Kelompok KKN Kampung Herbal Berua" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Logo Universitas Hasanuddin" }).first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Sumber Gambar/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Jalan Tematik/ }).first()).toBeVisible();
  await expect(
    page.getByLabel("Carousel tanaman pilihan").getByRole("link", {
      name: "Buka profil tanaman",
    }),
  ).toHaveCount(90);
  await expect(page.getByRole("link", { exact: true, name: "Jahe" })).toBeVisible();
  await expect(page.getByRole("link", { exact: true, name: "Meniran" })).toBeVisible();
  await expect(page.getByText("Rimpang aromatik")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Peta Kompleks Kampung Herbal" })).toBeVisible();
  await expect(page.getByText("Dalam penyusunan").first()).toBeVisible();
  await expect(page.getByText("9", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Lihat Peta Kampung" })).toBeVisible();
  await expect(
    page.getByText("Zona Imunitas Kuat, Zona Pencernaan Sehat", {
      exact: false,
    }),
  ).toHaveCount(0);
  await expect(
    page.locator('[data-placeholder-variant="plant"]').first(),
  ).toBeVisible();
  for (const streetName of [
    "Jl. Digestia",
    "Jl. Respiria",
    "Jl. Glycemia",
    "Jl. Lipidia",
    "Jl. Imun",
    "Jl. Hepatia",
    "Jl. Feminia",
    "Jl. Vaskulia",
    "Jl. Pediatria",
  ]) {
    await expect(page.getByText(streetName, { exact: true }).first()).toBeVisible();
  }
  await expectNoPublicPlaceholderText(page);
  await expectNoHorizontalOverflow(page);
  await expectNoBrokenImages(page);
});

test("desktop dan mobile navbar tetap accessible dengan struktur publik", async ({
  page,
}) => {
  await page.setViewportSize({ height: 800, width: 1280 });
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Navigasi utama" });
  await expect(nav.getByRole("link", { exact: true, name: "Beranda" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Edukasi" })).toBeVisible();
  await expect(nav.getByRole("link", { exact: true, name: "Peta Kampung" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Informasi Kampung" })).toBeVisible();
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
  const infoButton = nav.getByRole("button", { name: "Informasi Kampung" });
  await infoButton.click();
  await expect(page.getByRole("menuitem", { name: "Jalan Tematik" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Produk Warga" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Peta Kampung" })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.setViewportSize({ height: 812, width: 375 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: /menu navigasi/ });
  await menuButton.click();
  const mobileNav = page.getByRole("navigation", { name: "Navigasi mobile" });
  await expect(mobileNav.getByRole("link", { name: "Tanaman TOGA" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Zona Kesehatan" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Peta Kampung" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Jalan Tematik" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Produk Warga" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Ramuan Sehat" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("produk contoh tampil dan WhatsApp memuat produk yang dipilih", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Contoh Produk Kampung Herbal" }),
  ).toBeVisible();
  await expect(page.getByText("Produk contoh").first()).toBeVisible();

  await page.goto("/produk");
  await expect(
    page.getByRole("heading", { name: "Katalog Produk Kampung Herbal" }),
  ).toBeVisible();
  await expect(page.locator("[data-product-grid] article")).toHaveCount(6);

  const products = [
    ["teh-herbal-berua", "Teh Herbal Berua"],
    ["minuman-jahe-rempah", "Minuman Jahe Rempah"],
    ["kunyit-asam", "Kunyit Asam"],
    ["simplisia-herbal-kering", "Simplisia Herbal Kering"],
    ["bibit-tanaman-toga", "Bibit Tanaman TOGA"],
    ["paket-tanaman-herbal-rumah", "Paket Tanaman Herbal Rumah"],
  ] as const;

  for (const [slug, name] of products) {
    await expect(page.getByRole("link", { exact: true, name })).toBeVisible();
    await expect(
      page.getByRole("img", { name: `Ilustrasi produk contoh: ${name}` }).first(),
    ).toBeVisible();
    await expect(page.locator(`a[href="/produk/${slug}"]`).first()).toBeVisible();
  }

  const firstHref = await page
    .locator('a[href^="https://wa.me/6289623080501"]')
    .nth(0)
    .getAttribute("href");
  const secondHref = await page
    .locator('a[href^="https://wa.me/6289623080501"]')
    .nth(1)
    .getAttribute("href");
  const firstMessage = new URL(firstHref ?? "").searchParams.get("text") ?? "";
  const secondMessage = new URL(secondHref ?? "").searchParams.get("text") ?? "";

  expect(firstMessage).toContain("Produk: Teh Herbal Berua");
  expect(secondMessage).toContain("Produk: Minuman Jahe Rempah");
  expect(firstMessage).not.toBe(secondMessage);
  expect(firstMessage).toContain("Harga: Belum dikonfirmasi");
  expect(firstMessage).not.toMatch(/undefined|null/i);

  for (const [slug, name] of products) {
    await page.goto(`/produk/${slug}`);
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(
      page.getByRole("img", { name: `Ilustrasi produk contoh: ${name}` }),
    ).toBeVisible();
    await expect(page.getByText("Produk contoh").first()).toBeVisible();
    await expect(page.getByText("Belum dikonfirmasi").first()).toBeVisible();
    await expect(page.getByText("Segera tersedia").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Tanyakan via WhatsApp" }),
    ).toHaveAttribute("href", /https:\/\/wa\.me\/6289623080501/);
    await expectNoBrokenImages(page);
    await expectNoUndefinedOrNull(page);
  }

  await page.setViewportSize({ height: 900, width: 320 });
  await page.goto("/produk");
  await expectNoHorizontalOverflow(page);
  await expectNoBrokenImages(page);

  expect(
    (await request.get("/qr/jalan/digestia", { maxRedirects: 0 })).status(),
  ).toBe(307);
  expect(
    (await request.get("/qr/zona/pencernaan-sehat", { maxRedirects: 0 })).status(),
  ).toBe(307);
});

test("katalog tanaman gabungan dapat dicari dan tidak menggandakan tanaman berulang", async ({
  page,
}) => {
  await page.goto("/tanaman");

  await expect(
    page.getByRole("heading", {
      name: "Katalog Tanaman Kampung Herbal Harmony",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Menampilkan \d+ dari \d+ tanaman\./)).toBeVisible();
  await expect(
    page.getByRole("link", { exact: true, name: "Cincau Hijau" }),
  ).toBeVisible();
  await expect(
    page.locator('[data-placeholder-variant="plant"]').first(),
  ).toBeVisible();

  await page.getByLabel("Cari tanaman").fill("jahe");
  await expect(page.getByText(/Menampilkan 1 dari \d+ tanaman\./)).toBeVisible();
  await expect(page.getByRole("link", { exact: true, name: "Jahe" })).toHaveCount(1);

  await page.getByLabel("Cari tanaman").fill("");
  await page.getByLabel("Filter zona").selectOption("Zona Jantung Sehat");
  await expect(page.getByText(/Menampilkan \d+ dari \d+ tanaman\./)).toBeVisible();
  await expect(page.locator('a[href="/tanaman/seledri"]').first()).toBeVisible();
  await expect(
    page.getByText("Nomor poster lama", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Menampilkan 206 dari 216 nomor poster sumber."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /No\. 216\s+Daun Salam/ })).toBeVisible();
  await expectNoPublicPlaceholderText(page);
});

test("detail tanaman menampilkan HerbaCode dan manfaat tetap terpisah per zona", async ({
  page,
}) => {
  await page.goto("/tanaman/jahe");

  await expect(page.getByRole("heading", { name: "Jahe" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Tanaman Jahe" })).toBeVisible();
  await expect(page.getByText("Zingiber officinale Roscoe")).toBeVisible();
  await expect(page.getByRole("link", { name: "Zona Pencernaan Sehat" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Zona Tulang & Sendi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Senyawa aktif" })).toBeVisible();
  // Jahe now appears in 8 zones (was 4), so "Gingerol" shows up in several
  // compound chips/lists on the page -- match the first occurrence rather
  // than requiring exactly one.
  await expect(page.getByText("Gingerol").first()).toBeVisible();
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
  await expect(page.getByText("Jl. Imun")).toBeVisible();
  await expect(page.getByText("Sistem imun membantu tubuh")).toBeVisible();
  await expect(
    page.getByText(
      "Data tanaman dan pemanfaatan tradisional pada zona ini bersumber dari HerbaCode.",
    ),
  ).toHaveCount(0);
  await expect(page.getByText("Zona HerbaCode", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tanaman pada zona ini" })).toBeVisible();
  await expect(
    page.getByText(
      "Informasi tanaman dan pemanfaatan tradisional pada bagian ini bersumber dari HerbaCode.",
    ),
  ).toBeVisible();
  await expect(page.locator("[data-zone-plant-card]")).toHaveCount(11);
  await expect(page.getByRole("img", { name: "Tanaman Meniran" })).toBeVisible();
  await expect(page.locator('[data-zone-plant-card][href="/tanaman/meniran"]')).toBeVisible();
  await expect(page.getByText("Phyllanthin", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Membantu meningkatkan sistem imun tubuh.")).toHaveCount(0);
  await expect(page.getByText("HerbaCode Kampung Herbal Harmony", { exact: true }).first()).toBeVisible();
  const plantHrefs = await page
    .locator("[data-zone-plant-card]")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set(plantHrefs).size).toBe(plantHrefs.length);
  await expectNoBrokenImages(page);
  await expectNoPublicPlaceholderText(page);

  await page.getByRole("link", { name: "Meniran" }).click();
  await expect(page).toHaveURL(/\/tanaman\/meniran/);
  await expect(page.getByRole("heading", { name: "Meniran" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Phyllanthin", { exact: true })).toBeVisible();
});

test("daftar zona memakai deskripsi topik kesehatan yang berbeda", async ({
  page,
}) => {
  await page.goto("/zona-kesehatan");

  const descriptions = await page
    .locator("[data-zone-description]")
    .allTextContents();

  expect(descriptions).toHaveLength(20);
  expect(new Set(descriptions).size).toBe(20);
  for (const description of descriptions) {
    expect(description.trim().length).toBeGreaterThan(0);
    expect(description).not.toBe(
      "Data tanaman dan pemanfaatan tradisional pada zona ini bersumber dari HerbaCode.",
    );
  }
  await expect(page.getByText("Sistem pencernaan mengolah makanan")).toBeVisible();
  await expectNoPublicPlaceholderText(page);
  await expectNoHorizontalOverflow(page);
});

test("peta menampilkan 9 jalan tematik yang dipulihkan", async ({ page }) => {
  await page.goto("/peta");

  await expect(
    page.getByRole("heading", { name: "Lokasi Kampung Herbal Harmony Berua" }),
  ).toBeVisible();
  const locationCard = page.getByRole("region", {
    name: "Lokasi Kampung Herbal Harmony Berua",
  });
  await expect(locationCard.getByText("RT 009/RW 006", { exact: true })).toBeVisible();
  await expect(locationCard.getByText("Kelurahan Berua", { exact: true })).toBeVisible();
  await expect(locationCard.getByText("Kecamatan Biringkanaya", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Buka di Google Maps" }),
  ).toHaveAttribute("href", "https://maps.app.goo.gl/LZi2bArDspCxwpgn6");
  await expect(
    page.getByRole("link", { name: "Petunjuk Arah" }),
  ).toHaveAttribute("href", "https://maps.app.goo.gl/LZi2bArDspCxwpgn6");
  await expect(
    page.getByRole("heading", { name: "Peta Kompleks Kampung Herbal" }),
  ).toBeVisible();
  await expect(page.getByText("Dalam penyusunan")).toBeVisible();
  for (const legend of [
    "Jalan tematik",
    "Zona kesehatan",
    "Fasilitas",
    "Pintu masuk",
    "Titik informasi",
  ]) {
    await expect(page.getByText(legend, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Daftar Zona Kesehatan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Daftar Jalan Tematik" })).toBeVisible();
  await expect(page.getByText("Peta publik tidak menampilkan koordinat rumah")).toBeVisible();

  for (const streetName of [
    "Jl. Digestia",
    "Jl. Respiria",
    "Jl. Glycemia",
    "Jl. Lipidia",
    "Jl. Imun",
    "Jl. Hepatia",
    "Jl. Feminia",
    "Jl. Vaskulia",
    "Jl. Pediatria",
  ]) {
    await expect(page.getByText(streetName, { exact: true }).first()).toBeVisible();
  }

  await expectNoPublicPlaceholderText(page);
  await expectNoHorizontalOverflow(page);
});

const STREET_ZONE_PAIRS = [
  { streetSlug: "digestia", streetName: "Digestia", zoneSlug: "pencernaan-sehat" },
  { streetSlug: "respiria", streetName: "Respiria", zoneSlug: "pernapasan-lega" },
  { streetSlug: "glycemia", streetName: "Glycemia", zoneSlug: "gula-darah-terkendali" },
  { streetSlug: "lipidia", streetName: "Lipidia", zoneSlug: "obesitas-dan-metabolik" },
  { streetSlug: "imun", streetName: "Imun", zoneSlug: "imunitas-kuat" },
  { streetSlug: "hepatia", streetName: "Hepatia", zoneSlug: "hati-sehat" },
  { streetSlug: "feminia", streetName: "Feminia", zoneSlug: "kesehatan-perempuan" },
  { streetSlug: "vaskulia", streetName: "Vaskulia", zoneSlug: "jantung-sehat" },
  { streetSlug: "pediatria", streetName: "Pediatria", zoneSlug: "anak-ceria" },
] as const;

async function getPlantSlugsOnPage(page: Page) {
  const hrefs = await page.locator('a[href^="/tanaman/"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") ?? ""),
  );

  return new Set(
    hrefs
      .map((href) => href.replace(/^\/tanaman\//, "").split(/[/?#]/)[0])
      .filter((slug): slug is string => Boolean(slug)),
  );
}

test("jalan tematik menampilkan foto dan daftar tanaman mengikuti zona kesehatan pasangan", async ({
  page,
}) => {
  test.setTimeout(180_000);

  await page.goto("/jalan");

  await expect(
    page.getByRole("heading", { name: "Jalan Tematik Kampung Herbal" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Buka detail Jl\./ })).toHaveCount(9);

  for (const { streetName } of STREET_ZONE_PAIRS) {
    await expect(
      page.getByRole("img", { name: `Papan tanaman di Jl. ${streetName}` }),
    ).toBeVisible();
  }

  await page.goto("/jalan/imun");
  await expect(page.getByRole("heading", { name: "Jl. Imun" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Papan tanaman di Jl. Imun" }),
  ).toBeVisible();
  await expect(page.getByText("Dokumentasi KKN Kampung Herbal Berua, 2026.")).toBeVisible();
  await expect(
    page.getByText(
      "Daftar ini mengikuti entri HerbaCode yang telah dipublikasikan pada zona kesehatan pasangan jalan ini.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tanaman pada jalan ini" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Zona Imunitas Kuat" })).toBeVisible();

  await page.goto("/zona-kesehatan/imunitas-kuat");
  await expect(page.getByRole("img", { name: /Papan tanaman di Jl\./ })).toHaveCount(0);

  // Core requirement: each street's displayed plant slugs must be identical
  // to its paired health zone's displayed plant slugs (published entries
  // only) -- not a hardcoded list, so this stays correct as HerbaCode
  // content changes.
  for (const { streetSlug, zoneSlug } of STREET_ZONE_PAIRS) {
    await page.goto(`/jalan/${streetSlug}`);
    const streetPlantSlugs = await getPlantSlugsOnPage(page);

    await page.goto(`/zona-kesehatan/${zoneSlug}`);
    const zonePlantSlugs = await getPlantSlugsOnPage(page);

    expect(streetPlantSlugs.size).toBeGreaterThan(0);
    expect([...streetPlantSlugs].sort()).toEqual([...zonePlantSlugs].sort());
  }

  await page.goto("/jalan/imun");
  await expectNoPublicPlaceholderText(page);
  await expectNoHorizontalOverflow(page);
  await expectNoBrokenImages(page);

  await page.setViewportSize({ height: 900, width: 320 });
  await page.goto("/peta");
  await expect(
    page.getByRole("heading", { name: "Peta Kompleks Kampung Herbal" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Daftar Jalan Tematik" }),
  ).toBeVisible();
  await expectNoPublicPlaceholderText(page);
  await expectNoHorizontalOverflow(page);
});

test("halaman publik utama bebas placeholder, undefined, dan null", async ({
  page,
}) => {
  test.setTimeout(120_000);

  const routes = [
    "/",
    "/tanaman",
    "/tanaman/jahe",
    "/jalan",
    "/jalan/imun",
    "/zona-kesehatan",
    "/zona-kesehatan/imunitas-kuat",
    "/peta",
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
  expect((await request.get("/sumber-gambar")).status()).toBe(404);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("/tanaman/jahe");
  expect(sitemapText).toContain("/tanaman/willow-bark");
  expect(sitemapText).toContain("/jalan/imun");
  expect(sitemapText).toContain("/zona-kesehatan/imunitas-kuat");
  expect(sitemapText).not.toContain("/sumber-gambar");
  expect(sitemapText).not.toContain("/z/khb-z01");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  await expect(robots.text()).resolves.toContain("sitemap");
});
