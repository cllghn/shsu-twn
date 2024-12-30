import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = {
  basePath: '/app',
};

module.exports = {
  distDir: 'app/.next',
};

export default nextConfig;
