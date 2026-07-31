import { describe, expect, it } from "vitest";
import {
  detectImageMime,
  sha256,
  storageKey,
} from "@/lib/media/image-processing";

describe("sha256", () => {
  it("is deterministic for the same buffer", () => {
    const buffer = Buffer.from("kampung herbal berua");
    expect(sha256(buffer)).toBe(sha256(Buffer.from("kampung herbal berua")));
  });

  it("differs for different buffers", () => {
    expect(sha256(Buffer.from("a"))).not.toBe(sha256(Buffer.from("b")));
  });
});

describe("detectImageMime", () => {
  it("detects JPEG magic bytes", () => {
    expect(
      detectImageMime(Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x00])),
    ).toBe("image/jpeg");
  });

  it("detects PNG magic bytes", () => {
    expect(
      detectImageMime(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
      ),
    ).toBe("image/png");
  });

  it("detects WebP magic bytes", () => {
    const buffer = Buffer.alloc(16);
    buffer.write("RIFF", 0, "ascii");
    buffer.write("WEBP", 8, "ascii");
    expect(detectImageMime(buffer)).toBe("image/webp");
  });

  it("returns null for unrecognized bytes", () => {
    expect(detectImageMime(Buffer.from("not an image"))).toBeNull();
  });
});

describe("storageKey", () => {
  it("builds a path matching the storage RLS pattern", () => {
    const key = storageKey({
      entityKey: "Jahe Merah",
      hash: "abcdef0123456789",
      role: "cover",
      scope: "plants",
    });

    expect(key).toBe("plants/jahe-merah/cover-abcdef012345.webp");
    expect(key).toMatch(/^plants\/[a-z0-9][a-z0-9-]*\/[a-z0-9-]+\.webp$/);
  });

  it("strips characters outside the allowed slug charset", () => {
    const key = storageKey({
      entityKey: "  Zona Imun!! ",
      hash: "0000000000000000",
      role: "original",
      scope: "health-zones",
    });

    expect(key).toBe("health-zones/zona-imun/original-000000000000.webp");
  });
});
