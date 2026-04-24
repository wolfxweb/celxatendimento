/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/v1/tickets',
          destination: `${apiUrl}/api/v1/tickets/`,
        },
        {
          source: '/api/v1/tickets/:ticketId/audit-log',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/audit-log`,
        },
        {
          source: '/api/v1/tickets/:ticketId/relations',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/relations`,
        },
        {
          source: '/api/v1/tickets/:ticketId/messages',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/messages`,
        },
        {
          source: '/api/v1/tickets/:ticketId/assign',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/assign`,
        },
        {
          source: '/api/v1/tickets/:ticketId/rate',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/rate`,
        },
        {
          source: '/api/v1/tickets/:ticketId/ai/approve',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/ai/approve`,
        },
        {
          source: '/api/v1/tickets/:ticketId/ai/reject',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/ai/reject`,
        },
        {
          source: '/api/v1/tickets/:ticketId/ai/edit',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/ai/edit`,
        },
        {
          source: '/api/v1/tickets/:ticketId/ai/feedback',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/ai/feedback`,
        },
        {
          source: '/api/v1/tickets/:ticketId/ai/example',
          destination: `${apiUrl}/api/v1/tickets/:ticketId/ai/example`,
        },
        {
          source: '/api/v1/tickets/ai/stats',
          destination: `${apiUrl}/api/v1/tickets/ai/stats`,
        },
        {
          source: '/api/v1/categories',
          destination: `${apiUrl}/api/v1/categories/`,
        },
        {
          source: '/api/v1/ai-config',
          destination: `${apiUrl}/api/v1/ai-config/`,
        },
        {
          source: '/api/v1/companies',
          destination: `${apiUrl}/api/v1/companies/`,
        },
        {
          source: '/api/v1/plans',
          destination: `${apiUrl}/api/v1/plans/`,
        },
        {
          source: '/api/v1/users/me',
          destination: `${apiUrl}/api/v1/users/me`,
        },
        {
          source: '/api/v1/tickets/:path*',
          destination: `${apiUrl}/api/v1/tickets/:path*`,
        },
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ],
    }
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
