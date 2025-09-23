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
  },
  // Conditional output based on deployment target
  ...(process.env.DOCKER_BUILD && { output: 'standalone' }),
  // Optimize for Render deployment
  experimental: {
    outputFileTracingRoot: process.cwd(),
    esmExternals: false,
  },
  // Chunk loading optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Force static optimization
  trailingSlash: false,
  poweredByHeader: false,
  // Webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
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

      // Optimize chunk loading for paths with special characters
      config.output = {
        ...config.output,
        publicPath: '/_next/',
        chunkLoadTimeout: 60000, // 60 seconds timeout
        crossOriginLoading: false,
        hashFunction: 'xxhash64',
      };

      // Optimize chunk splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }
    return config;
  },
  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Headers for security and chunk loading optimization
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
