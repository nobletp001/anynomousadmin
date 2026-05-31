import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
