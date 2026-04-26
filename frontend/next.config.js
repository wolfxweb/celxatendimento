/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/v1/companies/:path*',
        destination: `${apiUrl}/api/v1/companies/:path*`,
      },
      {
        source: '/api/v1/tickets/:path*',
        destination: `${apiUrl}/api/v1/tickets/:path*`,
      },
      {
        source: '/api/v1/categories/:path*',
        destination: `${apiUrl}/api/v1/categories/:path*`,
      },
      {
        source: '/api/v1/users/:path*',
        destination: `${apiUrl}/api/v1/users/:path*`,
      },
      {
        source: '/api/v1/knowledge/:path*',
        destination: `${apiUrl}/api/v1/knowledge/:path*`,
      },
      {
        source: '/api/v1/ai-config/:path*',
        destination: `${apiUrl}/api/v1/ai-config/:path*`,
      },
      {
        source: '/api/v1/plans/:path*',
        destination: `${apiUrl}/api/v1/plans/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ]
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
