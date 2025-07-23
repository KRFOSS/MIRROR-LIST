import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL("https://cdn.krfoss.org/web/**")],
  },
};

export default nextConfig;
