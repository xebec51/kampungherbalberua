import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "xkvgpauprhggykaxffkh.supabase.co",
        pathname: "/storage/v1/object/public/media-public/**",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
