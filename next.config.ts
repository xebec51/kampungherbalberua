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
  images: {
    remotePatterns,
  },
};

export default nextConfig;
