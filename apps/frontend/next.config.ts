import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@rag/shared'],
  poweredByHeader: false,
};

export default nextConfig;
