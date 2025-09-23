/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Minimal webpack config for chunk loading issues
  webpack: (config, { isServer, dev }) => {
    if (!isServer && dev) {
      // Development-specific optimizations
      config.output = {
        ...config.output,
        publicPath: '/_next/',
        chunkLoadTimeout: 120000, // 2 minutes
      };
      
      // Disable some optimizations that might cause issues
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
    }
    
    // Node.js fallbacks
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
    
    return config;
  },
};

export default nextConfig;
