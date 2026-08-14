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

test("Kinerja RT menampilkan peta persebaran kelompok usia dari aset publik", async ({
  page,
}) => {
  await page.goto("/kinerja-rt");

  await expect(
    page.getByRole("heading", { name: "Program dan capaian RT" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Peta Persebaran Kelompok Usia" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "RT 009/RW 006 - Kelurahan Berua - Kecamatan Biringkanaya - Kota Makassar",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("KKN Prestasi Gel. 116 - Universitas Hasanuddin"),
  ).toBeVisible();

  await expect(
    page.getByRole("img", {
      name: /Peta Persebaran Kelompok Usia RT 009\/RW 006 Berua/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Unduh PNG Resolusi Tinggi" }),
  ).toHaveAttribute(
    "href",
    "/images/peta/peta-persebaran-kelompok-usia-rt009-rw006.png",
  );
  await expect(
    page.getByRole("link", { name: "Buka Gambar Ukuran Penuh" }),
  ).toHaveAttribute(
    "href",
    "/images/peta/peta-persebaran-kelompok-usia-rt009-rw006.webp",
  );
  await expect(
    page.getByText("tidak menyalin titik peta menjadi koordinat"),
  ).toBeVisible();

  await expectNoBrokenImages(page);
  await expectNoHorizontalOverflow(page);
});

test("peta kelompok usia tetap nyaman pada viewport mobile", async ({ page }) => {
  await page.setViewportSize({ height: 812, width: 375 });
  await page.goto("/kinerja-rt");

  await expect(
    page.getByRole("heading", { name: "Peta Persebaran Kelompok Usia" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", {
      name: "Area gulir Peta Persebaran Kelompok Usia",
    }),
  ).toBeVisible();
  await expectNoBrokenImages(page);
  await expectNoHorizontalOverflow(page);
});
