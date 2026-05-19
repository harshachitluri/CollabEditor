import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ✅ FIX 5: Turbopack + Monaco optimization */
  experimental: {
    // Optimizes watch mode for large monorepos
    swcDiagnostics: true,
  },
  
  // ✅ Ensure external dependencies are properly handled
  webpack: (config, { isServer }) => {
    // Prevent trying to bundle monaco in certain contexts
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        // Use terser for better tree-shaking of unused Monaco code
        usedExports: true,
      };
    }
    return config;
  },
};

export default nextConfig;

