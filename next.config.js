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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.returnaddress.io https://accounts.returnaddress.io",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://clerk.returnaddress.io https://api.clerk.dev https://accounts.returnaddress.io",
              "frame-src 'self' https://clerk.returnaddress.io https://accounts.returnaddress.io",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

// Don't set generateBuildId - let Next.js use default
module.exports = nextConfig

