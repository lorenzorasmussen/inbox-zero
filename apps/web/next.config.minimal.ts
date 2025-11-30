import nextMdx from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';
import { withAxiom } from 'next-axiom';
import { env } from './env';

const withMDX = nextMdx({
  options: {
    remarkPlugins: [[require.resolve('remark-gfm')]],
  },
});

const nextConfig: NextConfig = {
  // React strict mode disabled for minimal memory usage
  reactStrictMode: false,

  // Standalone output for minimal container resources
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,

  // Disable build-time linting to reduce memory
  eslint: { ignoreDuringBuilds: true },

  // Minimal server packages
  serverExternalPackages: ['@sentry/nextjs', '@sentry/node'],

  // Turbopack for development with minimal memory
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Minimal page extensions
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],

  // Optimized images with minimal processing
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com',
      },
      {
        protocol: 'https',
        hostname: 'ph-avatars.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.getinboxzero.com',
      },
    ],
    // Minimal image optimization
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828],
    imageSizes: [16, 32, 48, 64, 96, 128],
    minimumCacheTTL: 86400, // 24 hours
  },

  // Experimental optimizations for minimal resources
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'date-fns',
      '@headlessui/react',
      '@tanstack/react-query',
      '@tanstack/react-table',
    ],
    // Minimal CSS optimization
    optimizeCss: true,
    // Disable server React optimization for minimal memory
    optimizeServerReact: false,
    // Minimal large page data
    largePageDataBytes: 64 * 1024, // 64KB
  },

  // Webpack optimizations for minimal memory
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Minimal code splitting
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'async', // Only split async chunks to reduce memory
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'async',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };

      // Tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true; // More aggressive side effects elimination

      // Minimal minification for production
      if (!dev) {
        config.optimization.minimize = true;
      }
    }

    return config;
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production to reduce bundle size
    removeConsole: process.env.NODE_ENV === 'production',
    // Disable styled components optimization for minimal memory
    styledComponents: false,
    // Minimal SWC minification
    swcMinify: true,
  },

  // Minimal redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/automation',
        has: [
          {
            type: 'cookie',
            key: '__Secure-better-auth.session_token',
          },
        ],
        permanent: false,
      },
      {
        source: '/',
        destination: '/setup',
        has: [
          {
            type: 'cookie',
            key: '__Secure-better-auth.session-token.1',
          },
        ],
        permanent: false,
      },
    ];
  },

  // Minimal rewrites
  async rewrites() {
    return [
      {
        source: '/ingest/:path*',
        destination: 'https://app.posthog.com/:path*',
      },
    ];
  },

  // Minimal headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
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

// Sentry configuration with minimal overhead
const sentryOptions = {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORGANIZATION,
  project: process.env.SENTRY_PROJECT,
};

const sentryConfig = {
  widenClientFileUpload: false, // Reduce memory usage
  transpileClientSDK: false, // Reduce bundle size
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false, // Reduce monitoring overhead
};

const mdxConfig = withMDX(nextConfig);

const useSentry =
  process.env.NEXT_PUBLIC_SENTRY_DSN &&
  process.env.SENTRY_ORGANIZATION &&
  process.env.SENTRY_PROJECT;

const exportConfig = useSentry
  ? withSentryConfig(mdxConfig, { ...sentryOptions, ...sentryConfig })
  : mdxConfig;

// Environment validation (minimal)
if (!env.AUTH_SECRET && !env.NEXTAUTH_SECRET) {
  throw new Error(
    'Either AUTH_SECRET or NEXTAUTH_SECRET environment variable must be defined'
  );
}

if (env.MICROSOFT_CLIENT_ID && !env.MICROSOFT_WEBHOOK_CLIENT_STATE) {
  throw new Error(
    'MICROSOFT_WEBHOOK_CLIENT_STATE environment variable must be defined'
  );
}

// Minimal service worker configuration
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: env.NODE_ENV !== 'production',
  maximumFileSizeToCacheInBytes: 1024 * 1024, // 1MB (reduced from 3MB)
  // Minimal runtime caching
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
      strategy: 'CacheFirst',
      cacheName: 'google-fonts',
      expiration: 7 * 24 * 60 * 60, // 7 days (reduced from 1 year)
    },
  ],
});

export default withAxiom(withSerwist(exportConfig));
