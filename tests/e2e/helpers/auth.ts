import { expect, type Page } from "@playwright/test";

export const testPassword = "TestPassword123!";

export const testUsers = {
  admin: "admin@test.invalid",
  editor: "editor@test.invalid",
  validator: "validator@test.invalid",
  viewer: "viewer@test.invalid",
} as const;

export type TestRole = keyof typeof testUsers;
type StaffTestRole = Exclude<TestRole, "viewer">;

const roleLabels: Record<StaffTestRole, string> = {
  admin: "Admin",
  editor: "Editor",
  validator: "Validator",
};

export async function loginAs(page: Page, role: TestRole) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(testUsers[role]);
  await page.getByLabel("Kata sandi").fill(testPassword);
  await page.getByRole("button", { name: "Masuk" }).click();

  if (role === "viewer") {
    await expect(
      page.getByText("Akses ditolak. Hubungi pengelola website.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
    return;
  }

  await expectDashboard(page);
}

export async function expectDashboard(page: Page) {
  await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: "Dashboard Konten" })).toBeVisible();
}

export async function expectRoleBadge(page: Page, role: StaffTestRole) {
  await expect(
    page
      .getByRole("complementary")
      .getByText(roleLabels[role], { exact: true }),
  ).toBeVisible();
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
}
