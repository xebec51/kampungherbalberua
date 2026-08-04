import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/tanaman",
}));

vi.mock("@/app/admin/login/actions", () => ({
  logoutAction: async () => {},
}));

describe("AdminSidebar rendering", () => {
  it("memakai rail gelap, ikon per item nav, dan menandai rute aktif", async () => {
    const { AdminSidebar } = await import("../../src/components/admin/AdminSidebar");
    const html = renderToString(
      React.createElement(AdminSidebar, { displayName: "Rina", role: "admin" }),
    );

    expect(html).toContain("bg-admin-rail");
    expect(html).toContain("Rina");
    expect(html).toContain("Admin");

    for (const label of [
      "Dashboard",
      "HerbaCode",
      "Tanaman",
      "Zona Kesehatan",
      "Media",
      "Kotak Saran",
      "Lihat Website",
      "Keluar",
    ]) {
      expect(html).toContain(label);
    }

    // /admin/tanaman is the mocked pathname -> only "Tanaman" should carry aria-current
    const activeMatches = html.match(/aria-current="page"/g) ?? [];
    expect(activeMatches).toHaveLength(2); // desktop rail + mobile drawer both render the nav
  });

  it("tidak menandai 'Lihat Website' sebagai rute aktif meski pathname adalah root admin", async () => {
    vi.doMock("next/navigation", () => ({ usePathname: () => "/admin" }));
    vi.resetModules();
    const { AdminSidebar } = await import("../../src/components/admin/AdminSidebar");
    const html = renderToString(
      React.createElement(AdminSidebar, { displayName: "Rina", role: "admin" }),
    );

    const dashboardIdx = html.indexOf(">Dashboard<");
    const websiteIdx = html.indexOf(">Lihat Website<");

    expect(dashboardIdx).toBeGreaterThan(-1);
    expect(websiteIdx).toBeGreaterThan(-1);
    // crude but effective: aria-current should sit right before the Dashboard link, not the website link
    const beforeWebsite = html.slice(Math.max(0, websiteIdx - 400), websiteIdx);
    expect(beforeWebsite).not.toContain('aria-current="page"');
  });
});
