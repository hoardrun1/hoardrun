/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Conditional output based on deployment target
  ...(process.env.DOCKER_BUILD && { output: 'standalone' }),
  // Optimize for Render deployment
  experimental: {
    outputFileTracingRoot: process.cwd(),
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Enhanced webpack configuration for navigation performance
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
        winston: false,
        'winston-daily-rotate-file': false,
        'file-stream-rotator': false,
        nodemailer: false,
      };
    }

    // Development-specific optimizations for chunk loading issues
    if (!isServer && dev) {
      config.output = {
        ...config.output,
        publicPath: '/_next/',
        chunkLoadTimeout: 120000, // 2 minutes
      };
    }

    // Enhanced bundle splitting for better navigation performance
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // Framework chunk (React, Next.js)
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Large libraries
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1]
              return `npm.${packageName?.replace('@', '')}`
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Framer Motion - separate chunk for animations
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          // Radix UI components
          radixUI: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // AWS SDK
          awsSdk: {
            test: /[\\/]node_modules[\\/](@aws-sdk|aws-sdk)[\\/]/,
            name: 'aws-sdk',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Common utilities
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|clsx|class-variance-authority)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // Default vendor chunk
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };

      // Tree shaking optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Module resolution optimizations for faster navigation
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize React imports
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
    };

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
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
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
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
