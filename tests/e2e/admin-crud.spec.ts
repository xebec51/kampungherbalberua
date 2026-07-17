import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { cleanupE2EData, signInE2EClient } from "./helpers/supabase";

test.beforeAll(async () => {
  await cleanupE2EData();
});

test.afterAll(async () => {
  await cleanupE2EData();
});

test("editor dapat membuat dan mengubah draft tanaman tetapi tidak dapat publish/delete", async ({
  page,
}) => {
  const slug = "e2e-editor-plant";

  await loginAs(page, "editor");
  await page.goto("/admin/tanaman/baru");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Nama lokal").fill("E2E-Editor Plant");
  await page.getByLabel("Ringkasan").fill("Tanaman uji editor.");
  await page.getByLabel("Deskripsi").fill("Deskripsi tanaman uji editor.");
  await expect(page.getByLabel("Status konten").locator("option", { hasText: "Published" })).toHaveCount(0);
  await page.getByRole("button", { name: "Simpan tanaman" }).click();
  await expect(page).toHaveURL(/\/admin\/tanaman\/[^/]+\/edit/);
  await page.getByLabel("Ringkasan").fill("Tanaman uji editor yang diperbarui.");
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(page.getByText("Perubahan tanaman berhasil disimpan.")).toBeVisible();
  await expect(page.getByText("Hapus permanen")).toHaveCount(0);

  const editor = await signInE2EClient("editor");
  const { error } = await editor
    .from("plants")
    .update({ content_status: "published" })
    .eq("slug", slug);
  expect(error).not.toBeNull();
  await editor.auth.signOut();
});

test("validator dapat membaca daftar tetapi forged update ditolak", async ({ page }) => {
  await loginAs(page, "validator");
  await page.goto("/admin/tanaman");
  await expect(page.getByRole("heading", { name: "Daftar Tanaman" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tambah Tanaman" })).toHaveCount(0);

  const validator = await signInE2EClient("validator");
  const { error } = await validator
    .from("plants")
    .update({ short_description: "Forged validator update" })
    .eq("slug", "jahe");
  expect(error).not.toBeNull();
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
  await page.getByLabel("Status konten").selectOption("published");
  await page.getByRole("button", { name: "Simpan tanaman" }).click();
  await expect(page).toHaveURL(/\/admin\/tanaman\/[^/]+\/edit/);

  await page.goto(`/tanaman/${slug}`);
  await expect(page.getByRole("heading", { name: "E2E-Admin Plant" })).toBeVisible();

  await page.goto(`/admin/tanaman?q=${slug}`);
  await page.getByRole("button", { name: "Arsipkan" }).click();
  await expect(page.getByText("Tanaman berhasil diarsipkan.")).toBeVisible();

  await page.goto(`/tanaman/${slug}`);
  await expect(page.getByText("Tanaman tidak ditemukan")).toBeVisible();

  await page.goto(`/admin/tanaman?q=${slug}`);
  await page.getByText("Hapus permanen").click();
  await page.getByLabel(/Saya memahami penghapusan ini permanen/).check();
  await page.getByRole("button", { name: "Hapus Tanaman" }).click();
  await expect(page.getByText("Tanaman berhasil dihapus.")).toBeVisible();
});

test("editor zona dapat membuat draft tetapi tidak dapat publish/verified/delete", async ({
  page,
}) => {
  await loginAs(page, "editor");
  await page.goto("/admin/zona/baru");
  await page.getByLabel("Kode zona").fill("khb-z90");
  await page.getByLabel("Slug").fill("e2e-editor-zone");
  await page.getByLabel("Nama jalan").fill("Jl. E2E Editor");
  await page.getByLabel("Nama zona").fill("Zona E2E Editor");
  await page.getByLabel("Blok").fill("E2E-1");
  await page.getByLabel("Fokus materi").fill("Materi edukasi umum.");
  await page.getByLabel("Ringkasan").fill("Zona uji editor.");
  await page.getByLabel("Gambaran umum").fill("Gambaran umum zona uji editor.");
  await expect(page.getByLabel("Status konten").locator("option", { hasText: "Published" })).toHaveCount(0);
  await expect(page.getByLabel("Status validasi").locator("option", { hasText: "Terverifikasi" })).toHaveCount(0);
  await page.getByRole("button", { name: "Simpan zona" }).click();
  await expect(page).toHaveURL(/\/admin\/zona\/[^/]+\/edit/);
  await expect(page.getByText("Hapus permanen")).toHaveCount(0);
});

test("validator zona read-only", async ({ page }) => {
  await loginAs(page, "validator");
  await page.goto("/admin/zona");
  await expect(page.getByRole("heading", { name: "Zona Kesehatan" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tambah Zona" })).toHaveCount(0);
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
  await page.getByLabel("Status konten").selectOption("published");
  await page.getByRole("button", { name: "Simpan zona" }).click();
  await expect(page).toHaveURL(/\/admin\/zona\/[^/]+\/edit/);
  const editUrl = page.url();
  const zoneId = editUrl.match(/\/admin\/zona\/([^/]+)\/edit/)?.[1];
  expect(zoneId).toBeTruthy();

  await page.goto("/zona-kesehatan/e2e-admin-zone");
  await expect(page.getByRole("heading", { name: "Jl. E2E Admin" })).toBeVisible();

  const svg = await page.request.get(`/admin/zona/${zoneId}/qr?format=svg`);
  expect(svg.ok()).toBe(true);
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
