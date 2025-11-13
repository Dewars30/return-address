/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.returnaddress.io https://*.clerk.services https://challenges.cloudflare.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' https://img.clerk.com data:",
              "font-src 'self' data:",
              "connect-src 'self' https://clerk.returnaddress.io https://*.clerk.services https://vercel.live",
              "frame-src 'self' https://clerk.returnaddress.io https://*.clerk.services https://vercel.live",
              "worker-src 'self' blob: https://clerk.returnaddress.io",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

// Don't set generateBuildId - let Next.js use default
module.exports = nextConfig

