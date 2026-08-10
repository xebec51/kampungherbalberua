import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { cleanupE2EData, hasSupabaseE2EEnv } from "./helpers/supabase";

test.skip(
  !hasSupabaseE2EEnv(),
  "Supabase lokal dibutuhkan untuk CRUD Katalog Penyakit E2E.",
);

test.beforeAll(async () => {
  if (!hasSupabaseE2EEnv()) {
    return;
  }

  await cleanupE2EData();
});

test.afterAll(async () => {
  if (!hasSupabaseE2EEnv()) {
    return;
  }

  await cleanupE2EData({ failOnError: false });
});

test("katalog penyakit publik menampilkan seluruh 10 penyakit dari signboard", async ({
  page,
}) => {
  await page.goto("/penyakit");
  await expect(
    page.getByRole("heading", { name: "Katalog Penyakit Kampung Herbal" }),
  ).toBeVisible();

  for (const name of [
    "Hiperkolesterolemia",
    "Diabetes Melitus",
    "Gastritis (Maag)",
    "Demam",
    "Diare",
    "Hiperurisemia (Asam Urat)",
    "Alergi",
    "Hipertensi",
    "Common Cold (Pilek dan Batuk)",
    "Obat Luka",
  ]) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }
});

test("detail penyakit menampilkan manfaat dan tautan tanaman, termasuk entri non-tanaman", async ({
  page,
}) => {
  await page.goto("/penyakit/obat-luka");
  await expect(page.getByRole("heading", { name: "Obat Luka" })).toBeVisible();
  await expect(page.getByText("Mendukung penyembuhan luka")).toBeVisible();

  // "Yodium" is a signboard entry that is not a plant and never resolves --
  // it must still render as a plain label, just not as a link.
  await expect(
    page.getByRole("link", { name: "Yodium" }),
  ).toHaveCount(0);
  await expect(page.getByText("Yodium", { exact: true })).toBeVisible();
});

test("admin dapat membuat penyakit baru dengan tanaman tertaut dan tidak tertaut, lalu tautan balik muncul di halaman tanaman", async ({
  page,
}) => {
  const slug = "e2e-kondisi-uji";

  await loginAs(page, "admin");
  await page.goto("/admin/penyakit/baru");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Nama penyakit").fill("E2E Kondisi Uji");
  await page.getByLabel("Urutan tampil").fill("99");
  await page.getByLabel("Ringkasan singkat").fill("Ringkasan uji E2E.");
  await page.getByLabel("Deskripsi").fill("Deskripsi uji E2E untuk kondisi kesehatan.");
  await page.getByLabel("Manfaat").fill("Membantu uji coba otomatis");
  await page.getByLabel("Daftar tanaman").fill("Jahe\nBahan Rekaan Tidak Ada");
  await page.getByRole("button", { name: "Simpan penyakit" }).click();
  await expect(page).toHaveURL(/\/admin\/penyakit\/[^/]+\/edit/);
  await expect(page.getByText("Penyakit berhasil dibuat.")).toBeVisible();

  await page.goto(`/penyakit/${slug}`);
  await expect(page.getByRole("heading", { name: "E2E Kondisi Uji" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Jahe", exact: true })).toHaveAttribute(
    "href",
    "/tanaman/jahe",
  );
  await expect(
    page.getByRole("link", { name: "Bahan Rekaan Tidak Ada" }),
  ).toHaveCount(0);
  await expect(page.getByText("Bahan Rekaan Tidak Ada", { exact: true })).toBeVisible();

  await page.goto("/tanaman/jahe");
  await expect(page.getByText("Membantu meringankan")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "E2E Kondisi Uji" }),
  ).toHaveAttribute("href", `/penyakit/${slug}`);

  await page.goto(`/admin/penyakit?q=${slug}`);
  await page.getByRole("button", { name: "Hapus Permanen" }).click();
  const deleteDialog = page.getByRole("dialog", { name: "Hapus permanen?" });
  await deleteDialog.getByLabel(/Saya memahami penghapusan ini permanen/).check();
  await deleteDialog.getByRole("button", { name: "Ya, hapus permanen" }).click();
  await expect(page.getByText("Penyakit berhasil dihapus.")).toBeVisible();

  await page.goto(`/penyakit/${slug}`);
  await expect(page).toHaveTitle(/Penyakit tidak ditemukan/);

  await page.goto("/tanaman/jahe");
  await expect(page.getByText("Membantu meringankan")).toHaveCount(0);
});

test("navigasi Edukasi memuat tautan Katalog Penyakit", async ({ page }) => {
  await page.setViewportSize({ height: 800, width: 1280 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Navigasi utama" });
  await nav.getByRole("button", { name: "Edukasi" }).click();
  await page.getByRole("menuitem", { name: "Katalog Penyakit" }).click();
  await expect(page).toHaveURL(/\/penyakit$/);
});
