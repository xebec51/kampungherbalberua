import { createHash } from "node:crypto";
import sharp from "sharp";

export function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function detectImageMime(buffer: Buffer): string | null {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "image/jpeg";
  }

  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }

  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export async function optimizeWebp(
  buffer: Buffer,
  maxWidth: number,
  maxHeight: number,
) {
  return sharp(buffer, { failOn: "warning" })
    .rotate()
    .resize({
      fit: "inside",
      height: maxHeight,
      withoutEnlargement: true,
      width: maxWidth,
    })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
}

// Mirrors the `^(plants|health-zones|...)/[a-z0-9][a-z0-9-]*/[a-z0-9-]+\.(webp)$`
// storage RLS pattern in 20260728092000_create_media_storage_policies.sql --
// changing this shape must stay in sync with that migration.
export function storageKey(input: {
  entityKey: string;
  hash: string;
  role: string;
  scope: string;
}) {
  const safeEntityKey = input.entityKey
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${input.scope}/${safeEntityKey}/${input.role}-${input.hash.slice(0, 12)}.webp`;
}
