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
  // SEO iyileştirmeleri
  poweredByHeader: false, // "X-Powered-By" header'ı kaldır
  
  // rewrites yerine redirects kullanın (www olmayan adresleri www'ye yönlendirmek için)
  async redirects() {
    return [
      // www olmayan URL'leri www'li versiyona yönlendir
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'innelegance.com',
          },
        ],
        destination: 'https://www.innelegance.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;