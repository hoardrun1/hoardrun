const isProduction = process.env.NODE_ENV === 'production'

// The API's origin, from NEXT_PUBLIC_API_URL (set in the host's settings)
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'https://hoardrun-backend-py-1.onrender.com/api/v1').origin
  } catch {
    return ''
  }
})()

// Every outside service the browser talks to. Adding one (a script, an iframe, an API) means adding it here.
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inlines its start-up script; development also needs eval for fast refresh
  `script-src 'self' 'unsafe-inline' ${isProduction ? '' : "'unsafe-eval'"} https://js.stripe.com https://cdn.plaid.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    apiOrigin,
    isProduction ? '' : 'http://localhost:8000 http://127.0.0.1:8000 ws://localhost:3000',
    'https://data-api.binance.vision wss://data-stream.binance.vision',
    'https://api.stripe.com https://production.plaid.com https://sandbox.plaid.com https://development.plaid.com',
  ].filter(Boolean).join(' '),
  // Stripe's card-detail fields and Plaid Link open in frames from their own domains
  'frame-src https://js.stripe.com https://hooks.stripe.com https://cdn.plaid.com',
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isProduction ? ['upgrade-insecure-requests'] : []),
].join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't advertise the framework
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Minimal webpack config to avoid factory errors
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Exclude Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        child_process: false,
        os: false,
        net: false,
        tls: false,
        dns: false,
      };
    }

    // Development-specific optimizations
    if (!isServer && dev) {
      config.output = {
        ...config.output,
        publicPath: '/_next/',
        chunkLoadTimeout: 120000, // 2 minutes
      };
    }

    return config;
  },
  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          ...(isProduction
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Identity checks happen on Persona's own page, so Hoardrun never needs the camera
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Dev chunks keep the same URL between builds, so caching them serves stale code.
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/_next/static/(.*)',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
