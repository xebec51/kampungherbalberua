import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loginAs } from "./helpers/auth";
import { cleanupE2EData, signInE2EClient } from "./helpers/supabase";
import type { Database } from "../../src/lib/supabase/database.types";

test.beforeAll(async () => {
  await cleanupE2EData();
});

test.afterAll(async () => {
  await cleanupE2EData({ failOnError: false });
});

async function ensureQrFixtureZone(
  admin: SupabaseClient<Database>,
  slug = "e2e-qr-zone",
) {
  const { error } = await admin.from("health_zones").upsert(
    {
      block_ranges: ["E2E-QR"],
      content_status: "published",
      health_topic: "Materi edukasi umum.",
      overview: "Gambaran umum zona QR E2E.",
      short_description: "Zona QR E2E.",
      slug,
      street_name: "Jl. QR E2E",
      validation_status: "pending",
      zone_code: "khb-z92",
      zone_name: "Zona QR E2E",
    },
    { onConflict: "zone_code" },
  );

  if (error) {
    throw error;
  }
}

test("QR permanen redirect sementara dan kode invalid 404", async ({ request }) => {
  const redirect = await request.get("/z/khb-z01", { maxRedirects: 0 });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toContain("/zona-kesehatan/imunitas-kuat");

  const invalid = await request.get("/z/not-a-code");
  expect(invalid.status()).toBe(404);
});

test("perubahan slug tidak mengubah target permanen QR", async ({ request }) => {
  const admin = await signInE2EClient("admin");
  await ensureQrFixtureZone(admin);
  await admin
    .from("health_zones")
    .update({ slug: "e2e-qr-zone-sehat" })
    .eq("zone_code", "khb-z92");

  const changed = await request.get("/z/khb-z92", { maxRedirects: 0 });
  expect(changed.status()).toBe(307);
  expect(changed.headers().location).toContain("/zona-kesehatan/e2e-qr-zone-sehat");
  expect(changed.headers().location).not.toContain("/z/e2e-qr-zone");

  await admin
    .from("health_zones")
    .update({ slug: "e2e-qr-zone" })
    .eq("zone_code", "khb-z92");
  await admin.auth.signOut();
});

test("endpoint download QR menghasilkan SVG dan PNG dengan filename aman", async ({
  page,
}) => {
  const admin = await signInE2EClient("admin");
  await ensureQrFixtureZone(admin);
  const { data, error } = await admin
    .from("health_zones")
    .select("id")
    .eq("zone_code", "khb-z92")
    .single();

  if (error || !data) {
    throw error ?? new Error("Zona khb-z92 tidak ditemukan.");
  }

  await loginAs(page, "admin");

  const svg = await page.request.get(`/admin/zona/${data.id}/qr?format=svg`, {
    maxRedirects: 0,
  });
  expect(svg.status()).toBe(200);
  expect(svg.headers()["content-type"]).toContain("image/svg+xml");
  expect(svg.headers()["content-disposition"]).toContain("qr-khb-z92-e2e-qr-zone.svg");

  const png = await page.request.get(`/admin/zona/${data.id}/qr?format=png`, {
    maxRedirects: 0,
  });
  expect(png.status()).toBe(200);
  expect(png.headers()["content-type"]).toContain("image/png");
  expect(png.headers()["content-disposition"]).toContain("qr-khb-z92-e2e-qr-zone.png");

  await admin.auth.signOut();
});
