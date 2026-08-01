import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loginAs } from "./helpers/auth";
import {
  cleanupE2EData,
  hasSupabaseE2EEnv,
  signInE2EClient,
} from "./helpers/supabase";
import type { Database } from "../../src/lib/supabase/database.types";

const streetQrTargets = [
  ["digestia", "/jalan/digestia"],
  ["respiria", "/jalan/respiria"],
  ["glycemia", "/jalan/glycemia"],
  ["lipidia", "/jalan/lipidia"],
  ["imun", "/jalan/imun"],
  ["hepatia", "/jalan/hepatia"],
  ["feminia", "/jalan/feminia"],
  ["vaskulia", "/jalan/vaskulia"],
  ["pediatria", "/jalan/pediatria"],
] as const;

const zoneQrTargets = [
  ["imunitas-kuat", "/zona-kesehatan/imunitas-kuat"],
  ["pencernaan-sehat", "/zona-kesehatan/pencernaan-sehat"],
  ["ginjal-sehat", "/zona-kesehatan/ginjal-sehat"],
  ["hati-sehat", "/zona-kesehatan/hati-sehat"],
  ["jantung-sehat", "/zona-kesehatan/jantung-sehat"],
  ["tulang-dan-sendi", "/zona-kesehatan/tulang-dan-sendi"],
  ["kesehatan-mulut", "/zona-kesehatan/kesehatan-mulut"],
  ["anti-mikroba", "/zona-kesehatan/anti-mikroba"],
  ["kesehatan-perempuan", "/zona-kesehatan/kesehatan-perempuan"],
] as const;

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

function skipWithoutSupabaseE2E() {
  test.skip(
    !hasSupabaseE2EEnv(),
    "Supabase lokal dibutuhkan untuk fixture QR admin.",
  );
}

async function ensureQrFixtureZone(
  admin: SupabaseClient<Database>,
  slug = "e2e-qr-zone",
  contentStatus: Database["public"]["Tables"]["health_zones"]["Insert"]["content_status"] =
    "published",
) {
  const published = contentStatus === "published";
  const { error } = await admin.from("health_zones").upsert(
    {
      block_ranges: ["E2E-QR"],
      content_status: contentStatus,
      health_topic: "Materi edukasi umum.",
      overview: "Gambaran umum zona QR E2E.",
      qr_key: "e2e-qr-zone",
      short_description: "Zona QR E2E.",
      slug,
      source_notes: ["Fixture E2E QR zona."],
      street_name: "Jl. QR E2E",
      validation_checked_at: published ? "2026-07-30T00:00:00.000Z" : null,
      validation_status: published ? "verified" : "pending",
      validator_name: published ? "Admin E2E" : null,
      zone_code: "khb-z92",
      zone_name: "Zona QR E2E",
    },
    { onConflict: "zone_code" },
  );

  if (error) {
    throw error;
  }
}

async function ensureQrFixturePlant(
  admin: SupabaseClient<Database>,
  slug = "e2e-qr-plant",
  contentStatus: Database["public"]["Tables"]["plants"]["Insert"]["content_status"] =
    "published",
) {
  const published = contentStatus === "published";
  const { error } = await admin.from("plants").upsert(
    {
      category: "daun",
      content_status: contentStatus,
      description: "Tanaman QR E2E.",
      local_name: "Tanaman QR E2E",
      qr_key: "e2e-qr-plant",
      short_description: "Tanaman QR E2E.",
      slug,
      source_notes: published ? "Fixture E2E QR tanaman." : null,
      validation_checked_at: published ? "2026-07-30T00:00:00.000Z" : null,
      validation_status: published ? "verified" : "pending",
      validator_name: published ? "Admin E2E" : null,
    },
    { onConflict: "qr_key" },
  );

  if (error) {
    throw error;
  }
}

async function ensureQrFixtureStreet(
  admin: SupabaseClient<Database>,
  slug = "e2e-qr-street",
  contentStatus: Database["public"]["Tables"]["streets"]["Insert"]["content_status"] =
    "published",
) {
  const { error } = await admin.from("streets").upsert(
    {
      content_status: contentStatus,
      description: "Jalan QR E2E.",
      qr_key: "e2e-qr-street",
      slug,
      source_notes: ["Fixture E2E QR jalan."],
      street_name: "Jl. E2E QR Street",
      validation_status: "pending",
    },
    { onConflict: "qr_key" },
  );

  if (error) {
    throw error;
  }
}

test("seluruh QR jalan redirect ke halaman jalan yang tepat", async ({
  request,
}) => {
  for (const [qrKey, targetPath] of streetQrTargets) {
    const redirect = await request.get(`/qr/jalan/${qrKey}`, { maxRedirects: 0 });
    expect(redirect.status(), qrKey).toBe(307);
    expect(redirect.headers().location, qrKey).toContain(targetPath);
    expect(redirect.headers().location, qrKey).not.toContain("/zona-kesehatan/");
  }
});

test("seluruh QR zona redirect ke halaman zona yang tepat", async ({
  request,
}) => {
  for (const [qrKey, targetPath] of zoneQrTargets) {
    const redirect = await request.get(`/qr/zona/${qrKey}`, { maxRedirects: 0 });
    expect(redirect.status(), qrKey).toBe(307);
    expect(redirect.headers().location, qrKey).toContain(targetPath);
    expect(redirect.headers().location, qrKey).not.toContain("/jalan/");
  }
});

test("perubahan slug tidak merusak QR publik baru", async ({ request }) => {
  skipWithoutSupabaseE2E();

  const admin = await signInE2EClient("admin");
  await ensureQrFixtureZone(admin);
  await ensureQrFixtureStreet(admin);
  await ensureQrFixturePlant(admin);

  await admin
    .from("health_zones")
    .update({ slug: "e2e-qr-zone-sehat" })
    .eq("qr_key", "e2e-qr-zone");
  await admin
    .from("streets")
    .update({ slug: "e2e-qr-street-baru" })
    .eq("qr_key", "e2e-qr-street");
  await admin
    .from("plants")
    .update({ slug: "e2e-qr-plant-baru" })
    .eq("qr_key", "e2e-qr-plant");

  const zoneRedirect = await request.get("/qr/zona/e2e-qr-zone", {
    maxRedirects: 0,
  });
  expect(zoneRedirect.status()).toBe(307);
  expect(zoneRedirect.headers().location).toContain(
    "/zona-kesehatan/e2e-qr-zone-sehat",
  );

  const streetRedirect = await request.get("/qr/jalan/e2e-qr-street", {
    maxRedirects: 0,
  });
  expect(streetRedirect.status()).toBe(307);
  expect(streetRedirect.headers().location).toContain(
    "/jalan/e2e-qr-street-baru",
  );

  const plantRedirect = await request.get("/qr/tanaman/e2e-qr-plant", {
    maxRedirects: 0,
  });
  expect(plantRedirect.status()).toBe(307);
  expect(plantRedirect.headers().location).toContain(
    "/tanaman/e2e-qr-plant-baru",
  );

  await admin.auth.signOut();
});

test("QR invalid dan target draft menghasilkan 404", async ({ request }) => {
  skipWithoutSupabaseE2E();

  const admin = await signInE2EClient("admin");
  await ensureQrFixtureZone(admin, "e2e-qr-zone-draft", "draft");
  await ensureQrFixtureStreet(admin, "e2e-qr-street-draft", "draft");
  await ensureQrFixturePlant(admin, "e2e-qr-plant-draft", "draft");

  expect((await request.get("/qr/jalan/tidak-ada")).status()).toBe(404);
  expect((await request.get("/qr/zona/tidak-ada")).status()).toBe(404);
  expect((await request.get("/qr/tanaman/tidak-ada")).status()).toBe(404);
  expect((await request.get("/qr/zona/khb-z01")).status()).toBe(404);
  expect((await request.get("/qr/zona/e2e-qr-zone")).status()).toBe(404);
  expect((await request.get("/qr/jalan/e2e-qr-street")).status()).toBe(404);
  expect((await request.get("/qr/tanaman/e2e-qr-plant")).status()).toBe(404);

  await admin.auth.signOut();
});

test("route QR publik yang tidak valid menghasilkan 404", async ({ request }) => {
  expect((await request.get("/qr/jalan/kunci%20salah")).status()).toBe(404);
  expect((await request.get("/qr/zona/kunci%20salah")).status()).toBe(404);
  expect((await request.get("/qr/tanaman/kunci%20salah")).status()).toBe(404);
  expect((await request.get("/qr/zona/khb-z01")).status()).toBe(404);
});

test("route legacy zona tetap redirect untuk kompatibilitas", async ({ request }) => {
  const redirect = await request.get("/z/khb-z01", { maxRedirects: 0 });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toContain("/zona-kesehatan/imunitas-kuat");

  const invalid = await request.get("/z/not-a-code");
  expect(invalid.status()).toBe(404);
});

test("endpoint download QR zona dan jalan menghasilkan SVG/PNG production", async ({
  page,
}) => {
  skipWithoutSupabaseE2E();

  const admin = await signInE2EClient("admin");
  await ensureQrFixtureZone(admin);
  await ensureQrFixtureStreet(admin);
  await ensureQrFixturePlant(admin);

  const zone = await admin
    .from("health_zones")
    .select("id")
    .eq("qr_key", "e2e-qr-zone")
    .single();
  const street = await admin
    .from("streets")
    .select("id")
    .eq("qr_key", "e2e-qr-street")
    .single();
  const plant = await admin
    .from("plants")
    .select("id")
    .eq("qr_key", "e2e-qr-plant")
    .single();

  if (zone.error || !zone.data) {
    throw zone.error ?? new Error("Zona QR E2E tidak ditemukan.");
  }

  if (street.error || !street.data) {
    throw street.error ?? new Error("Jalan QR E2E tidak ditemukan.");
  }

  if (plant.error || !plant.data) {
    throw plant.error ?? new Error("Tanaman QR E2E tidak ditemukan.");
  }

  await loginAs(page, "admin");
  await page.goto("/admin");
  await expect(
    page.getByText("https://kampungherbalberua.web.id/qr/zona/e2e-qr-zone"),
  ).toBeVisible();
  await expect(
    page.getByText("https://kampungherbalberua.web.id/qr/jalan/e2e-qr-street"),
  ).toBeVisible();

  await page.goto(`/admin/tanaman/${plant.data.id}/edit`);
  await expect(
    page.getByText("https://kampungherbalberua.web.id/qr/tanaman/e2e-qr-plant"),
  ).toBeVisible();

  const zoneSvg = await page.request.get(
    `/admin/zona/${zone.data.id}/qr?format=svg`,
    { maxRedirects: 0 },
  );
  expect(zoneSvg.status()).toBe(200);
  expect(zoneSvg.headers()["content-type"]).toContain("image/svg+xml");
  expect(zoneSvg.headers()["content-disposition"]).toContain(
    "qr-zona-e2e-qr-zone.svg",
  );
  expect(await zoneSvg.text()).toContain("<svg");

  const zonePng = await page.request.get(
    `/admin/zona/${zone.data.id}/qr?format=png`,
    { maxRedirects: 0 },
  );
  expect(zonePng.status()).toBe(200);
  expect(zonePng.headers()["content-type"]).toContain("image/png");
  expect(zonePng.headers()["content-disposition"]).toContain(
    "qr-zona-e2e-qr-zone.png",
  );
  expect((await zonePng.body()).byteLength).toBeGreaterThan(1000);

  const streetSvg = await page.request.get(
    `/admin/jalan/${street.data.id}/qr?format=svg`,
    { maxRedirects: 0 },
  );
  expect(streetSvg.status()).toBe(200);
  expect(streetSvg.headers()["content-type"]).toContain("image/svg+xml");
  expect(streetSvg.headers()["content-disposition"]).toContain(
    "qr-jalan-e2e-qr-street.svg",
  );
  expect(await streetSvg.text()).toContain("<svg");

  const streetPng = await page.request.get(
    `/admin/jalan/${street.data.id}/qr?format=png`,
    { maxRedirects: 0 },
  );
  expect(streetPng.status()).toBe(200);
  expect(streetPng.headers()["content-type"]).toContain("image/png");
  expect(streetPng.headers()["content-disposition"]).toContain(
    "qr-jalan-e2e-qr-street.png",
  );
  expect((await streetPng.body()).byteLength).toBeGreaterThan(1000);

  const plantSvg = await page.request.get(
    `/admin/tanaman/${plant.data.id}/qr?format=svg`,
    { maxRedirects: 0 },
  );
  expect(plantSvg.status()).toBe(200);
  expect(plantSvg.headers()["content-type"]).toContain("image/svg+xml");
  expect(plantSvg.headers()["content-disposition"]).toContain(
    "qr-tanaman-e2e-qr-plant.svg",
  );
  expect(await plantSvg.text()).toContain("<svg");

  const plantPng = await page.request.get(
    `/admin/tanaman/${plant.data.id}/qr?format=png`,
    { maxRedirects: 0 },
  );
  expect(plantPng.status()).toBe(200);
  expect(plantPng.headers()["content-type"]).toContain("image/png");
  expect(plantPng.headers()["content-disposition"]).toContain(
    "qr-tanaman-e2e-qr-plant.png",
  );
  expect((await plantPng.body()).byteLength).toBeGreaterThan(1000);

  await admin.auth.signOut();
});
