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
  reactStrictMode: true,
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ['@sentry/nextjs', '@sentry/node'],
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'date-fns',
      '@headlessui/react',
      '@tanstack/react-query',
      '@tanstack/react-table',
      '@tanstack/react-virtual',
    ],
    optimizeCss: true,
    optimizeServerReact: true,
    scrollRestoration: true,
    largePageDataBytes: 128 * 1024, // 128KB
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Bundle optimization
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Code splitting configuration
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'async',
            enforce: true,
            priority: 5,
          },
          ui: {
            test: /[\\/]components[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
          utils: {
            test: /[\\/]utils[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 20,
          },
        },
      };

      // Tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Minification
      if (!dev) {
        config.optimization.minimize = true;
      }

      // Bundle analysis
      if (!dev) {
        config.plugins = config.plugins || [];
        config.plugins.push(
          new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analysis/report.html',
          })
        );
      }
    }
    
    return config;
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    swcMinify: true,
    styledComponents: true,
    emotion: true,
  },
  
  // Image optimization
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
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  
  // Performance headers
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
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  
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
      // ... existing redirects
    ];
  },
  
  async rewrites() {
    return [
      {
        source: '/ingest/:path*',
        destination: 'https://app.posthog.com/:path*',
      },
      {
        source: '/vendor/lemon/affiliate.js',
        destination: 'https://lmsqueezy.com/affiliate.js',
      },
      {
        source: '/_proxy/dub/track/:path',
        destination: 'https://api.dub.co/track/:path',
      },
      {
        source: '/_proxy/dub/script.js',
        destination: 'https://www.dubcdn.com/analytics/script.js',
      },
    ];
  },
  
  // Security headers (existing)
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
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
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "font-src 'self' data: https:",
              "img-src 'self' data: https: blob: https://image.mux.com https://*.litix.io",
              "media-src 'self' blob: https://*.mux.com",
              "worker-src 'self' blob:",
              "connect-src 'self' https: wss: https://*.mux.com https://*.litix.io",
              "frame-src 'self' https:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: env.NEXT_PUBLIC_BASE_URL,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
        ],
      },
    ];
  },
};

const sentryOptions = {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORGANIZATION,
  project: process.env.SENTRY_PROJECT,
};

const sentryConfig = {
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

const mdxConfig = withMDX(nextConfig);

const useSentry =
  process.env.NEXT_PUBLIC_SENTRY_DSN &&
  process.env.SENTRY_ORGANIZATION &&
  process.env.SENTRY_PROJECT;

const exportConfig = useSentry
  ? withSentryConfig(mdxConfig, { ...sentryOptions, ...sentryConfig })
  : mdxConfig;

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

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: env.NODE_ENV !== 'production',
  maximumFileSizeToCacheInBytes:3 * 1024 * 1024, // 3MB
  // Performance optimizations for service worker
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
      strategy: 'CacheFirst',
      cacheName: 'google-fonts',
      expiration: 365 * 24 * 60 * 60, // 1 year
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|gif|webp|avif|svg)$/,
      strategy: 'CacheFirst',
      cacheName: 'static-images',
      expiration: 30 * 24 * 60 * 60, // 30 days
    },
  ],
});

export default withAxiom(withSerwist(exportConfig));