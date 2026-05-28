import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Provide empty turbopack config to silence the Next.js 15+ error
  // about custom webpack configs while turbopack is enabled.
  turbopack: {},
  
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

