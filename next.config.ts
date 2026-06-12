import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lain.bgm.tv' },
      { protocol: 'http', hostname: 'lain.bgm.tv' },
    ],
  },
};

export default nextConfig;
