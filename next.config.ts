import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config: any, { dev }: any) => {
    if (dev) {
      config.watchOptions = {
        ignored: ['**/node_modules/**', '/data/**', '/data/data/**', '/**'],
      };
    }
    return config;
  },
};

export default nextConfig;
