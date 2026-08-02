import type { NextConfig } from "next";

const fallbackSupabaseStoragePattern = {
  hostname: "xkvgpauprhggykaxffkh.supabase.co",
  pathname: "/storage/v1/object/public/media-public/**",
  protocol: "https" as const,
};

function supabaseStoragePatternFromEnv() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return {
      hostname: url.hostname,
      pathname: "/storage/v1/object/public/media-public/**",
      port: url.port,
      protocol: url.protocol === "https:" ? "https" as const : "http" as const,
    };
  } catch {
    return null;
  }
}

const configuredSupabaseStoragePattern = supabaseStoragePatternFromEnv();
const remotePatterns = configuredSupabaseStoragePattern &&
  configuredSupabaseStoragePattern.hostname !== fallbackSupabaseStoragePattern.hostname
    ? [fallbackSupabaseStoragePattern, configuredSupabaseStoragePattern]
    : [fallbackSupabaseStoragePattern];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    serverActions: {
      // Raw admin photo uploads (before server-side WebP compression) can
      // exceed the 1mb server action default. The app's own MAX_UPLOAD_BYTES
      // check (src/lib/data/admin/media-upload.ts) rejects anything over
      // 10mb with a friendly Indonesian message -- this limit must stay
      // above that so oversized uploads reach that check instead of being
      // cut off earlier by Next's body parser (which fails with a generic
      // crash page, multipart encoding overhead included).
      bodySizeLimit: "12mb",
    },
    // Separate from serverActions.bodySizeLimit above -- without raising
    // this too, Next truncates the raw multipart request body at 10mb
    // before it reaches the server action at all ("Unexpected end of
    // form"), regardless of the serverActions limit.
    proxyClientMaxBodySize: "12mb",
  },
  images: {
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    formats: ["image/avif", "image/webp"],
    imageSizes: [32, 48, 64, 96, 128, 192, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [72, 75, 76],
    remotePatterns,
  },
};

export default nextConfig;
