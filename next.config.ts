import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Next.js 15 desteklenen experimental özellikleri burada tanımlanabilir
  },
  images: {
    remotePatterns: [
      {
        hostname: 'mfaexsxibqfwtpchkppy.supabase.co',
      },
    ],
  },
};

export default nextConfig;