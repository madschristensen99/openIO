import { fileURLToPath } from 'url';
import { dirname } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude 0g directory from build as it's a separate project
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...(config.watchOptions?.ignored || []),
        '**/0g/**',
        '**/node_modules/**',
      ],
    };
    return config;
  },
  // Ensure TypeScript works correctly
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;