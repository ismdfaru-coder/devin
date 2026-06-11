import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Server Actions / dev resources when the app is served through
  // v0 / Vercel preview proxies whose host differs from the origin header.
  allowedDevOrigins: ["*.vusercontent.net", "*.vercel.run"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.vusercontent.net", "*.vercel.run"],
    },
  },
};

export default nextConfig;
