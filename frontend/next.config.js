/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/v1/companies',
        destination: `${apiUrl}/api/v1/companies/`,
      },
      {
        source: '/api/v1/tickets',
        destination: `${apiUrl}/api/v1/tickets/`,
      },
      {
        source: '/api/v1/categories',
        destination: `${apiUrl}/api/v1/categories/`,
      },
      {
        source: '/api/v1/users',
        destination: `${apiUrl}/api/v1/users/`,
      },
      {
        source: '/api/v1/knowledge',
        destination: `${apiUrl}/api/v1/knowledge/`,
      },
      {
        source: '/api/v1/ai-config',
        destination: `${apiUrl}/api/v1/ai-config/`,
      },
      {
        source: '/api/v1/plans',
        destination: `${apiUrl}/api/v1/plans/`,
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
