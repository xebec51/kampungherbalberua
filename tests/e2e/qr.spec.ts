import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { cleanupE2EData, signInE2EClient } from "./helpers/supabase";

test.beforeAll(async () => {
  await cleanupE2EData();
});

test.afterAll(async () => {
  await cleanupE2EData();
});

test("QR permanen redirect sementara dan kode invalid 404", async ({ request }) => {
  const redirect = await request.get("/z/khb-z01", { maxRedirects: 0 });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toContain("/zona-kesehatan/digestia");

  const invalid = await request.get("/z/not-a-code");
  expect(invalid.status()).toBe(404);
});

test("perubahan slug tidak mengubah target permanen QR", async ({ request }) => {
  const admin = await signInE2EClient("admin");
  await admin.from("health_zones").update({ slug: "digestia-sehat" }).eq("zone_code", "khb-z01");

  const changed = await request.get("/z/khb-z01", { maxRedirects: 0 });
  expect(changed.status()).toBe(307);
  expect(changed.headers().location).toContain("/zona-kesehatan/digestia-sehat");
  expect(changed.headers().location).not.toContain("/z/digestia");

  await admin.from("health_zones").update({ slug: "digestia" }).eq("zone_code", "khb-z01");
  await admin.auth.signOut();
});

test("endpoint download QR menghasilkan SVG dan PNG dengan filename aman", async ({
  page,
}) => {
  const admin = await signInE2EClient("admin");
  const { data, error } = await admin
    .from("health_zones")
    .select("id")
    .eq("zone_code", "khb-z01")
    .single();

  if (error || !data) {
    throw error ?? new Error("Zona khb-z01 tidak ditemukan.");
  }

  await loginAs(page, "admin");

  const svg = await page.request.get(`/admin/zona/${data.id}/qr?format=svg`);
  expect(svg.ok()).toBe(true);
  expect(svg.headers()["content-type"]).toContain("image/svg+xml");
  expect(svg.headers()["content-disposition"]).toContain("qr-khb-z01-digestia.svg");

  const png = await page.request.get(`/admin/zona/${data.id}/qr?format=png`);
  expect(png.ok()).toBe(true);
  expect(png.headers()["content-type"]).toContain("image/png");
  expect(png.headers()["content-disposition"]).toContain("qr-khb-z01-digestia.png");

  await admin.auth.signOut();
});
