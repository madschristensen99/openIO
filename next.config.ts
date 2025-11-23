import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude 0g directory from build as it's a separate project
  // Turbopack config (Next.js 16+)
  turbopack: {},
  // Webpack config for compatibility
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/0g/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
