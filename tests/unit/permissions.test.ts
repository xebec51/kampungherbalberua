import { describe, expect, it } from "vitest";
import {
  canDeleteContent,
  canEditContent,
  canPublishContent,
  isStaffRole,
} from "@/lib/auth/permissions";

describe("permission role admin", () => {
  it("viewer tidak dapat membuka dashboard", () => {
    expect(isStaffRole("viewer")).toBe(false);
  });

  it("editor dapat membuat draft tetapi tidak dapat publish atau delete", () => {
    expect(isStaffRole("editor")).toBe(true);
    expect(canEditContent("editor")).toBe(true);
    expect(canPublishContent("editor")).toBe(false);
    expect(canDeleteContent("editor")).toBe(false);
  });

  it("validator read-only", () => {
    expect(isStaffRole("validator")).toBe(true);
    expect(canEditContent("validator")).toBe(false);
    expect(canPublishContent("validator")).toBe(false);
    expect(canDeleteContent("validator")).toBe(false);
  });

  it("admin dapat publish dan delete", () => {
    expect(isStaffRole("admin")).toBe(true);
    expect(canEditContent("admin")).toBe(true);
    expect(canPublishContent("admin")).toBe(true);
    expect(canDeleteContent("admin")).toBe(true);
  });
});
