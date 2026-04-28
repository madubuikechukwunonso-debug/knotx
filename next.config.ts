// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',   // ← This fixes the error (was 1mb)
    },
  },
};

export default nextConfig;
