import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import { loginAs } from "./helpers/auth";
import {
  cleanupE2EData,
  hasSupabaseE2EEnv,
  signInE2EClient,
} from "./helpers/supabase";

test.skip(
  !hasSupabaseE2EEnv(),
  "Supabase lokal dibutuhkan untuk E2E unggah foto admin.",
);

test.beforeAll(async () => {
  await cleanupE2EData();
});

test.afterAll(async () => {
  await cleanupE2EData({ failOnError: false });
});

async function makeJpeg(color: { r: number; g: number; b: number }) {
  return sharp({
    create: {
      background: color,
      channels: 3,
      height: 40,
      width: 40,
    },
  })
    .jpeg()
    .toBuffer();
}

async function createTestPlant(page: Page, slug: string, localName: string) {
  await page.goto("/admin/tanaman/baru");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Nama lokal").fill(localName);
  await page.getByLabel("Ringkasan").fill("Tanaman uji unggah foto.");
  await page.getByLabel("Deskripsi").fill("Deskripsi tanaman uji unggah foto.");
  await page.getByLabel("Catatan sumber").fill("E2E metadata pemeriksaan foto.");
  await page.getByRole("button", { name: "Simpan tanaman" }).click();
  await expect(page).toHaveURL(/\/admin\/tanaman\/[^/]+\/edit/);
  const id = page.url().match(/\/admin\/tanaman\/([^/]+)\/edit/)?.[1];
  expect(id).toBeTruthy();
  return id as string;
}

test("admin dapat mengunggah foto tanaman dan foto tampil sebagai sampul", async ({
  page,
}) => {
  await loginAs(page, "admin");
  const id = await createTestPlant(
    page,
    "e2e-photo-plant",
    "E2E-Photo Upload Plant",
  );

  await expect(
    page.getByRole("img", { name: "Foto E2E-Photo Upload Plant" }),
  ).toBeVisible();

  const buffer = await makeJpeg({ b: 80, g: 150, r: 100 });
  await page
    .locator('input[type="file"][name="photo"]')
    .setInputFiles({ buffer, mimeType: "image/jpeg", name: "sampul.jpg" });
  await page.getByRole("button", { name: "Unggah Foto", exact: true }).click();

  await expect(page).toHaveURL(/success=foto-diperbarui/);
  await expect(page.getByText("Foto tanaman berhasil diunggah.")).toBeVisible();

  // Local dev serves media from a private IP (127.0.0.1), which Next's
  // image optimizer wraps in /_next/image?url=<encoded>&... and refuses to
  // fetch (SSRF protection) -- so we only assert the *storage path*
  // resolved correctly, not that the image actually rendered. See
  // SafeImage's shouldBypassOptimizer(), which only bypasses supabase.co.
  const img = page.locator("figure img");
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("src", /e2e-photo-plant%2Fcover-/);

  void id;
});

test("unggah file bukan gambar ditolak dengan pesan format", async ({ page }) => {
  await loginAs(page, "admin");
  await createTestPlant(page, "e2e-photo-invalid", "E2E-Photo Invalid Plant");

  const buffer = Buffer.from("ini bukan berkas gambar sama sekali");
  await page
    .locator('input[type="file"][name="photo"]')
    .setInputFiles({ buffer, mimeType: "image/jpeg", name: "palsu.jpg" });
  await page.getByRole("button", { name: "Unggah Foto", exact: true }).click();

  await expect(page).toHaveURL(/error=foto-format/);
  await expect(
    page.getByText("Format foto tidak dikenali. Gunakan JPEG, PNG, atau WebP."),
  ).toBeVisible();
});

test("unggah file berukuran lebih dari 10MB ditolak dengan pesan ukuran", async ({
  page,
}) => {
  await loginAs(page, "admin");
  await createTestPlant(page, "e2e-photo-oversized", "E2E-Photo Oversized Plant");

  const buffer = Buffer.alloc(11 * 1024 * 1024, 0);
  await page
    .locator('input[type="file"][name="photo"]')
    .setInputFiles({ buffer, mimeType: "image/jpeg", name: "besar.jpg" });
  await page.getByRole("button", { name: "Unggah Foto", exact: true }).click();

  await expect(page).toHaveURL(/error=foto-ukuran/);
  await expect(
    page.getByText("Ukuran foto terlalu besar setelah dikompres."),
  ).toBeVisible();
});

test("unggah dua kali dengan konten identik (nama file berbeda) tidak membuat media_assets duplikat", async ({
  page,
}) => {
  await loginAs(page, "admin");
  const idA = await createTestPlant(
    page,
    "e2e-photo-dup-a",
    "E2E-Photo Dup Plant A",
  );
  const idB = await createTestPlant(
    page,
    "e2e-photo-dup-b",
    "E2E-Photo Dup Plant B",
  );

  const buffer = await makeJpeg({ b: 40, g: 90, r: 200 });

  await page.goto(`/admin/tanaman/${idA}/edit`);
  await page
    .locator('input[type="file"][name="photo"]')
    .setInputFiles({ buffer, mimeType: "image/jpeg", name: "duplikat-a.jpg" });
  await page.getByRole("button", { name: "Unggah Foto", exact: true }).click();
  await expect(page).toHaveURL(/success=foto-diperbarui/);

  await page.goto(`/admin/tanaman/${idB}/edit`);
  await page
    .locator('input[type="file"][name="photo"]')
    .setInputFiles({ buffer, mimeType: "image/jpeg", name: "duplikat-b-nama-lain.jpg" });
  await page.getByRole("button", { name: "Unggah Foto", exact: true }).click();
  await expect(page).toHaveURL(/success=foto-diperbarui/);

  const admin = await signInE2EClient("admin");
  const { data: linksA } = await admin
    .from("plant_media")
    .select("media_id")
    .eq("plant_id", idA)
    .eq("role", "cover")
    .single();
  const { data: linksB } = await admin
    .from("plant_media")
    .select("media_id")
    .eq("plant_id", idB)
    .eq("role", "cover")
    .single();

  expect(linksA?.media_id).toBeTruthy();
  expect(linksA?.media_id).toBe(linksB?.media_id);

  const { count } = await admin
    .from("media_assets")
    .select("id", { count: "exact", head: true })
    .eq("id", linksA?.media_id ?? "");
  expect(count).toBe(1);

  await admin.auth.signOut();
});

test("mengganti foto sampul tidak menghapus media_assets lama", async ({
  page,
}) => {
  await loginAs(page, "admin");
  const id = await createTestPlant(
    page,
    "e2e-photo-replace",
    "E2E-Photo Replace Plant",
  );

  const first = await makeJpeg({ b: 10, g: 200, r: 10 });
  await page
    .locator('input[type="file"][name="photo"]')
    .setInputFiles({ buffer: first, mimeType: "image/jpeg", name: "pertama.jpg" });
  await page.getByRole("button", { name: "Unggah Foto", exact: true }).click();
  await expect(page).toHaveURL(/success=foto-diperbarui/);
  const firstSrc = await page.locator("figure img").getAttribute("src");
  expect(firstSrc).toBeTruthy();

  const admin = await signInE2EClient("admin");
  const { data: firstLink } = await admin
    .from("plant_media")
    .select("media_id")
    .eq("plant_id", id)
    .eq("role", "cover")
    .single();
  const firstMediaId = firstLink?.media_id;
  expect(firstMediaId).toBeTruthy();

  const second = await makeJpeg({ b: 210, g: 10, r: 10 });
  await page
    .locator('input[type="file"][name="photo"]')
    .setInputFiles({ buffer: second, mimeType: "image/jpeg", name: "kedua.jpg" });
  await page.getByRole("button", { name: "Unggah Foto", exact: true }).click();
  await expect(page).toHaveURL(/success=foto-diperbarui/);
  // Both uploads redirect to the identical ?success=foto-diperbarui URL, so
  // toHaveURL above can resolve against the *first* upload's already-matching
  // URL without waiting for the second submission to actually land. Wait for
  // the rendered <img src> to change before trusting the DB has settled.
  await expect(page.locator("figure img")).not.toHaveAttribute("src", firstSrc as string);

  const { data: secondLink } = await admin
    .from("plant_media")
    .select("media_id")
    .eq("plant_id", id)
    .eq("role", "cover")
    .single();
  expect(secondLink?.media_id).toBeTruthy();
  expect(secondLink?.media_id).not.toBe(firstMediaId);

  const { data: oldMediaStillExists } = await admin
    .from("media_assets")
    .select("id")
    .eq("id", firstMediaId ?? "")
    .maybeSingle();
  expect(oldMediaStillExists).not.toBeNull();

  const { data: linkRows, error: linkRowsError } = await admin
    .from("plant_media")
    .select("media_id")
    .eq("plant_id", id)
    .eq("role", "cover");
  expect(linkRowsError).toBeNull();
  expect(linkRows).toHaveLength(1);

  await admin.auth.signOut();
});

test("tanaman tanpa foto utama menampilkan placeholder fallback", async ({
  page,
}) => {
  await loginAs(page, "admin");
  await createTestPlant(page, "e2e-photo-fallback", "E2E-Photo Fallback Plant");

  await expect(
    page.getByRole("img", { name: "Foto E2E-Photo Fallback Plant" }),
  ).toBeVisible();
  await expect(page.locator("figure img")).toHaveCount(0);
});

test("form unggah foto tetap tanpa overflow horizontal pada layar 320px", async ({
  page,
}) => {
  await page.setViewportSize({ height: 720, width: 320 });
  await loginAs(page, "admin");
  const id = await createTestPlant(
    page,
    "e2e-photo-320",
    "E2E-Photo Narrow Plant",
  );

  await page.goto(`/admin/tanaman/${id}/edit`);
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasOverflow).toBe(false);
  await expect(page.getByRole("button", { name: "Unggah Foto", exact: true })).toBeVisible();
});
