import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal turbopack configuration
  turbopack: {},
  
  // Handle Node.js built-ins properly
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      path: 'path-browserify',
      os: false,
      child_process: false,
    };
    return config;
  },
  
  // Configure server-side handling
  serverExternalPackages: ['@0glabs/0g-ts-sdk'],
  
  // Handle file paths and staging
  optimizeFonts: false,
};

export default nextConfig;
