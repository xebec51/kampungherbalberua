import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasOverflow).toBe(false);
}

test("modul PEDULI menampilkan tiga zona, identitas, dan disclaimer", async ({
  page,
}) => {
  await page.goto("/peduli");

  await expect(
    page.getByRole("heading", { exact: true, name: "PEDULI" }),
  ).toBeVisible();
  await expect(page.getByText("Buku Saku PEDULI")).toBeVisible();
  await expect(page.getByText("Malika Az Zahra Bahtiar")).toBeVisible();
  await expect(
    page.getByText("Prof. Dr. Ir. Suhasman, S.Hut., M.Si."),
  ).toBeVisible();
  await expect(page.getByText("panduan edukatif").first()).toBeVisible();
  await expect(page.getByText("bukan pengganti asesmen").first()).toBeVisible();

  for (const zoneName of ["Zona Anak", "Zona Dewasa", "Zona Rentan"]) {
    await expect(page.getByRole("heading", { name: zoneName })).toBeVisible();
  }

  await expect(page.getByRole("link", { name: /Bayi/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Dewasa Awal/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Penyandang Disabilitas/ }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("detail PEDULI menampilkan semua bagian panduan dan breadcrumb", async ({
  page,
}) => {
  for (const route of [
    "/peduli/infancy",
    "/peduli/early-adulthood",
    "/peduli/mental-health-conditions",
  ]) {
    await page.goto(route);

    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb.getByRole("link", { name: "Beranda" })).toBeVisible();
    await expect(breadcrumb.getByRole("link", { name: "PEDULI" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Karakteristik Utama" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Kebutuhan Utama" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Hal yang Perlu Dihindari" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Pendekatan Umum" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Rekomendasi Intervensi" }),
    ).toBeVisible();
    await expect(page.getByText("Halaman sumber")).toBeVisible();
    await expect(page.getByText("panduan edukatif").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test("PEDULI nyaman pada viewport mobile", async ({ page }) => {
  await page.setViewportSize({ height: 812, width: 375 });
  await page.goto("/peduli");
  await expect(
    page.getByRole("heading", { exact: true, name: "PEDULI" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/peduli/pregnant-women");
  await expect(
    page.getByRole("heading", {
      name: "Ibu Hamil pada Masa Kehamilan dan Pascapersalinan",
    }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
