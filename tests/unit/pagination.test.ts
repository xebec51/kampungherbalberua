import { describe, expect, it } from "vitest";
import {
  buildPaginatedHref,
  getPaginationWindow,
  paginateItems,
  parsePageParam,
} from "../../src/lib/pagination";

describe("pagination helpers", () => {
  it("mem-parse nomor halaman dengan fallback aman", () => {
    expect(parsePageParam("3")).toBe(3);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-2")).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam()).toBe(1);
  });

  it("membatasi halaman dan menghitung rentang item", () => {
    const result = paginateItems(["a", "b", "c", "d", "e"], 3, 2);

    expect(result.items).toEqual(["e"]);
    expect(result.currentPage).toBe(3);
    expect(result.startItem).toBe(5);
    expect(result.endItem).toBe(5);
    expect(result.totalPages).toBe(3);
  });

  it("membangun URL halaman tanpa filter kosong atau all", () => {
    expect(
      buildPaginatedHref(
        "/admin/tanaman",
        { content_status: "all", q: "jahe", validation_status: "" },
        2,
      ),
    ).toBe("/admin/tanaman?q=jahe&halaman=2");
    expect(buildPaginatedHref("/admin/tanaman", { q: "" }, 1)).toBe(
      "/admin/tanaman",
    );
  });

  it("membuat window halaman yang stabil di awal dan akhir daftar", () => {
    expect(getPaginationWindow(1, 10)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationWindow(9, 10)).toEqual([6, 7, 8, 9, 10]);
  });
});
