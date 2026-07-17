import { describe, expect, it } from "vitest";
import { getSafeAdminRedirect } from "@/lib/auth/safe-redirect";

describe("safe admin redirect", () => {
  it("menerima redirect internal admin", () => {
    expect(getSafeAdminRedirect("/admin")).toBe("/admin");
    expect(getSafeAdminRedirect("/admin/zona")).toBe("/admin/zona");
  });

  it("menolak URL eksternal, protocol-relative, dan javascript", () => {
    expect(getSafeAdminRedirect("https://example.com/admin")).toBe("/admin");
    expect(getSafeAdminRedirect("//domain.com/admin")).toBe("/admin");
    expect(getSafeAdminRedirect("javascript:alert(1)")).toBe("/admin");
  });
});
