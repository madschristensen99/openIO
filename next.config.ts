import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude 0g directory from build as it's a separate project
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/0g/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
