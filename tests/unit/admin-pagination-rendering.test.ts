import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminPagination } from "../../src/components/admin/AdminPagination";

const baseProps = {
  endItem: 20,
  params: { q: "jahe" },
  pathname: "/admin/tanaman",
  startItem: 11,
  totalItems: 40,
  totalPages: 4,
};

describe("AdminPagination rendering", () => {
  it("memakai ikon chevron dengan aria-label, bukan teks Sebelumnya/Selanjutnya", () => {
    const html = renderToString(
      React.createElement(AdminPagination, { ...baseProps, currentPage: 2 }),
    );

    expect(html).toContain('aria-label="Halaman sebelumnya"');
    expect(html).toContain('aria-label="Halaman berikutnya"');
    expect(html).not.toContain("Sebelumnya");
    expect(html).not.toContain("Selanjutnya");
  });

  it("menandai halaman aktif dan menampilkan tombol nomor halaman lain untuk loncat langsung", () => {
    const html = renderToString(
      React.createElement(AdminPagination, { ...baseProps, currentPage: 2 }),
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
    expect(html).toContain(">3<");
    expect(html).toContain(">4<");
    expect(html).toContain("/admin/tanaman?q=jahe&amp;halaman=3");
  });

  it("menonaktifkan tombol sebelumnya di halaman pertama sebagai span, bukan link", () => {
    const html = renderToString(
      React.createElement(AdminPagination, { ...baseProps, currentPage: 1 }),
    );

    expect(html).toMatch(
      /<span[^>]*aria-disabled="true"[^>]*aria-label="Halaman sebelumnya"/,
    );
  });

  it("tidak merender apa pun ketika hanya ada satu halaman", () => {
    const html = renderToString(
      React.createElement(AdminPagination, {
        ...baseProps,
        currentPage: 1,
        totalItems: 5,
        totalPages: 1,
      }),
    );

    expect(html).toBe("");
  });
});
