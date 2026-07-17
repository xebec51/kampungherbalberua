import { expect, test, type Page } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const viewports = [
  { height: 812, name: "mobile", width: 375 },
  { height: 1024, name: "tablet", width: 768 },
  { height: 900, name: "desktop", width: 1440 },
];

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasOverflow).toBe(false);
}

for (const viewport of viewports) {
  test(`layout responsive tanpa horizontal overflow pada ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/zona-kesehatan");
    await expectNoHorizontalOverflow(page);

    if (viewport.width < 1024) {
      await page.getByRole("button", { name: "Buka menu navigasi" }).click();
      await expect(page.getByRole("navigation", { name: "Navigasi mobile" })).toBeVisible();
    }

    await loginAs(page, "admin");
    await page.goto("/admin/zona");
    await expectNoHorizontalOverflow(page);

    await page.goto("/admin/zona/baru");
    await expect(page.getByRole("button", { name: "Simpan zona" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}
