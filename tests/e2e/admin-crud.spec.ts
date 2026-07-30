import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import {
  cleanupE2EData,
  hasSupabaseE2EEnv,
  signInE2EClient,
} from "./helpers/supabase";

test.skip(
  !hasSupabaseE2EEnv(),
  "Supabase lokal dibutuhkan untuk CRUD admin E2E.",
);

test.beforeAll(async () => {
  await cleanupE2EData();
});

test.afterAll(async () => {
  await cleanupE2EData({ failOnError: false });
});

test("editor tidak dapat membuka dashboard atau mengubah tanaman lewat RLS", async ({
  page,
}) => {
  await loginAs(page, "editor");
  await expect(page).toHaveURL(/\/admin\/login/);

  const editor = await signInE2EClient("editor");
  const { error: insertError } = await editor.from("plants").insert({
    category: "rimpang",
    description: "Desc",
    local_name: "E2E Editor Plant",
    short_description: "Short",
    slug: "e2e-editor-plant",
  });
  expect(insertError).not.toBeNull();
  const { error: updateError } = await editor
    .from("plants")
    .update({ short_description: "Forged editor update" })
    .eq("slug", "jahe");
  expect(updateError).not.toBeNull();
  await editor.auth.signOut();
});

test("validator tidak dapat membuka dashboard atau membaca draft admin", async ({ page }) => {
  await loginAs(page, "validator");
  await expect(page).toHaveURL(/\/admin\/login/);

  const validator = await signInE2EClient("validator");
  const { data, error: selectError } = await validator
    .from("plants")
    .select("short_description")
    .eq("content_status", "draft");
  expect(selectError).toBeNull();
  expect(data).toHaveLength(0);

  const { error: updateError } = await validator
    .from("plants")
    .update({ short_description: "Forged validator update" })
    .eq("slug", "jahe");
  expect(updateError).not.toBeNull();
  await validator.auth.signOut();
});

test("admin dapat membuat, publish, archive, dan delete tanaman", async ({
  page,
}) => {
  const slug = "e2e-admin-plant";

  await loginAs(page, "admin");
  await page.goto("/admin/tanaman/baru");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Nama lokal").fill("E2E-Admin Plant");
  await page.getByLabel("Ringkasan").fill("Tanaman uji admin.");
  await page.getByLabel("Deskripsi").fill("Deskripsi tanaman uji admin.");
  await page.getByLabel("Catatan sumber").fill("E2E metadata pemeriksaan.");
  await page.getByLabel("Nama pemeriksa").fill("Admin E2E");
  await page.getByLabel("Tanggal pemeriksaan").fill("2026-07-30");
  await page.getByLabel("Status validasi").selectOption("verified");
  await page.getByLabel("Status konten").selectOption("published");
  await page.getByRole("button", { name: "Simpan tanaman" }).click();
  await expect(page).toHaveURL(/\/admin\/tanaman\/[^/]+\/edit/);

  await page.goto(`/tanaman/${slug}`);
  await expect(page.getByRole("heading", { name: "E2E-Admin Plant" })).toBeVisible();

  await page.goto(`/admin/tanaman?q=${slug}`);
  await page.getByRole("button", { name: "Arsipkan" }).click();
  await expect(page.getByText("Tanaman berhasil diarsipkan.")).toBeVisible();

  await page.goto(`/tanaman/${slug}`);
  await expect(page).toHaveTitle(/Tanaman tidak ditemukan/);
  await expect(
    page.getByRole("heading", { name: "E2E-Admin Plant" }),
  ).toHaveCount(0);

  await page.goto(`/admin/tanaman?q=${slug}`);
  await page.getByText("Hapus permanen").click();
  await page.getByLabel(/Saya memahami penghapusan ini permanen/).check();
  await page.getByRole("button", { name: "Hapus Tanaman" }).click();
  await expect(page.getByText("Tanaman berhasil dihapus.")).toBeVisible();
});

test("admin zona dapat publish, mengunduh QR, mengubah slug, archive, dan delete", async ({
  page,
  request,
}) => {
  await loginAs(page, "admin");
  await page.goto("/admin/zona/baru");
  await page.getByLabel("Kode zona").fill("khb-z91");
  await page.getByLabel("Slug").fill("e2e-admin-zone");
  await page.getByLabel("Nama jalan").fill("Jl. E2E Admin");
  await page.getByLabel("Nama zona").fill("Zona E2E Admin");
  await page.getByLabel("Blok").fill("E2E-2");
  await page.getByLabel("Fokus materi").fill("Materi edukasi umum.");
  await page.getByLabel("Ringkasan").fill("Zona uji admin.");
  await page.getByLabel("Gambaran umum").fill("Gambaran umum zona uji admin.");
  await page.getByLabel("Catatan sumber").fill("E2E metadata pemeriksaan.");
  await page.getByLabel("Nama pemeriksa").fill("Admin E2E");
  await page.getByLabel("Tanggal pemeriksaan").fill("2026-07-30");
  await page.getByLabel("Status validasi").selectOption("verified");
  await page.getByLabel("Status konten").selectOption("published");
  await page.getByRole("button", { name: "Simpan zona" }).click();
  await expect(page).toHaveURL(/\/admin\/zona\/[^/]+\/edit/);
  const editUrl = page.url();
  const zoneId = editUrl.match(/\/admin\/zona\/([^/]+)\/edit/)?.[1];
  expect(zoneId).toBeTruthy();

  await page.goto("/zona-kesehatan/e2e-admin-zone");
  await expect(page.getByRole("heading", { name: "Zona E2E Admin" })).toBeVisible();

  const svg = await page.request.get(`/admin/zona/${zoneId}/qr?format=svg`, {
    maxRedirects: 0,
  });
  expect(svg.status()).toBe(200);
  expect(svg.headers()["content-type"]).toContain("image/svg+xml");

  await page.goto(`/admin/zona/${zoneId}/edit`);
  await page.getByLabel("Slug").fill("e2e-admin-zone-sehat");
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(page.getByText("Perubahan zona berhasil disimpan.")).toBeVisible();

  const redirect = await request.get("/z/khb-z91", { maxRedirects: 0 });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toContain("/zona-kesehatan/e2e-admin-zone-sehat");

  await page.goto(`/admin/zona?q=khb-z91`);
  await page.getByRole("button", { name: "Arsipkan" }).click();
  await expect(page.getByText("Zona berhasil diarsipkan.")).toBeVisible();

  await page.goto(`/admin/zona?q=khb-z91`);
  await page.getByText("Hapus permanen").click();
  await page.getByLabel(/Saya memahami penghapusan ini permanen/).check();
  await page.getByRole("button", { name: "Hapus Zona" }).click();
  await expect(page.getByText("Zona berhasil dihapus.")).toBeVisible();
});
