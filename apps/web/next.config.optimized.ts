import nextMdx from '@next/mdx';
import type { NextConfig } from 'next';

const withMDX = nextMdx({
  options: {
    remarkPlugins: [[require.resolve('remark-gfm')]],
  },
});

const nextConfig: NextConfig = {
  // Minimal resource optimizations
  reactStrictMode: false, // Disabled for minimal memory usage
  eslint: { ignoreDuringBuilds: true },

  // Optimized experimental features
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'date-fns',
      '@headlessui/react',
      '@tanstack/react-query',
    ],
    optimizeCss: true,
    optimizeServerReact: false, // Minimal memory usage
  },

  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],

  // Minimal webpack optimizations for async chunks only
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'async', // Only split async chunks for minimal memory usage
      };
    }
    return config;
  },

  // Optimized images with minimal processing
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'image.mux.com' },
      { protocol: 'https', hostname: 'ph-avatars.imgix.net' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.getinboxzero.com' },
    ],
    formats: ['image/webp'], // WebP only for minimal processing
    deviceSizes: [640, 750, 828], // Reduced breakpoints
    minimumCacheTTL: 86400, // 24 hours
  },

  // Minimal redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/automation',
        has: [{ type: 'cookie', key: '__Secure-better-auth.session_token' }],
        permanent: false,
      },
      {
        source: '/',
        destination: '/setup',
        has: [{ type: 'cookie', key: '__Secure-better-auth.session-token.1' }],
        permanent: false,
      },
    ];
  },

  // Minimal headers for performance
  async headers() {
    return [
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

const mdxConfig = withMDX(nextConfig);
export default mdxConfig;
