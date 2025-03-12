import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 在生產構建期間忽略 ESLint 錯誤
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生產構建期間忽略 TypeScript 錯誤
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
