import { expect, test } from "@playwright/test";
import { expectDashboard, loginAs, logout, testPassword, testUsers } from "./helpers/auth";

test("pengguna belum login diarahkan dari admin ke login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Masuk Dashboard" })).toBeVisible();
});

test("login gagal menampilkan pesan umum", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("tidak-ada@test.invalid");
  await page.getByLabel("Kata sandi").fill("salah");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("Email atau kata sandi tidak valid.")).toBeVisible();
});

test("viewer login ditolak", async ({ page }) => {
  await loginAs(page, "viewer");
  await expect(page.getByText("Akses ditolak. Hubungi pengelola website.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("editor dapat membuka dashboard dan logout", async ({ page }) => {
  await loginAs(page, "editor");
  await expectDashboard(page);
  await expect(page.getByText("Editor")).toBeVisible();
  await logout(page);
});

test("validator membuka dashboard read-only", async ({ page }) => {
  await loginAs(page, "validator");
  await expectDashboard(page);
  await expect(page.getByText("Validator")).toBeVisible();
  await page.goto("/admin/tanaman");
  await expect(page.getByRole("link", { name: "Tambah Tanaman" })).toHaveCount(0);
});

test("admin membuka dashboard penuh", async ({ page }) => {
  await loginAs(page, "admin");
  await expectDashboard(page);
  await expect(page.getByText("Admin")).toBeVisible();
  await page.goto("/admin/zona");
  await expect(page.getByRole("link", { name: "Tambah Zona" })).toBeVisible();
});

test("redirect eksternal ditolak dan session tidak memakai localStorage", async ({
  page,
}) => {
  await page.goto("/admin/login?next=https://example.com");
  await page.getByLabel("Email").fill(testUsers.editor);
  await page.getByLabel("Kata sandi").fill(testPassword);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const localStorageKeys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(localStorageKeys).toHaveLength(0);
});
