import { expect, test } from "@playwright/test";
import {
  expectDashboard,
  expectRoleBadge,
  loginAs,
  testPassword,
  testUsers,
} from "./helpers/auth";
import { hasSupabaseE2EEnv } from "./helpers/supabase";

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
  test.skip(!hasSupabaseE2EEnv(), "Supabase lokal dibutuhkan untuk login E2E.");

  await loginAs(page, "viewer");
  await expect(page.getByText("Akses ditolak. Hubungi pengelola website.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("editor login ditolak dari dashboard admin-only", async ({ page }) => {
  test.skip(!hasSupabaseE2EEnv(), "Supabase lokal dibutuhkan untuk login E2E.");

  await loginAs(page, "editor");
  await expect(page.getByText("Akses ditolak. Hubungi pengelola website.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("validator login ditolak dari dashboard admin-only", async ({ page }) => {
  test.skip(!hasSupabaseE2EEnv(), "Supabase lokal dibutuhkan untuk login E2E.");

  await loginAs(page, "validator");
  await expect(page.getByText("Akses ditolak. Hubungi pengelola website.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("admin membuka dashboard penuh", async ({ page }) => {
  test.skip(!hasSupabaseE2EEnv(), "Supabase lokal dibutuhkan untuk login E2E.");

  await loginAs(page, "admin");
  await expectDashboard(page);
  await expectRoleBadge(page, "admin");
  await page.goto("/admin/zona");
  await expect(page.getByRole("link", { name: "Tambah Zona" })).toBeVisible();
});

test("redirect eksternal ditolak dan session tidak memakai localStorage", async ({
  page,
}) => {
  test.skip(!hasSupabaseE2EEnv(), "Supabase lokal dibutuhkan untuk login E2E.");

  await page.goto("/admin/login?next=https://example.com");
  await page.getByLabel("Email").fill(testUsers.admin);
  await page.getByLabel("Kata sandi").fill(testPassword);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const localStorageKeys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(localStorageKeys).toHaveLength(0);
});
