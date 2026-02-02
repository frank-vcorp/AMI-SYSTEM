/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // CRÍTICO PARA MONOREPO: Transpilar paquetes locales en build
  transpilePackages: [
    '@ami/core',
    '@ami/core-auth',
    '@ami/core-database',
    '@ami/core-storage',
    '@ami/core-types',
    '@ami/core-ui',
    '@ami/mod-citas',
    '@ami/mod-clinicas',
    '@ami/mod-empresas',
    '@ami/mod-expedientes',
    '@ami/mod-reportes',
    '@ami/mod-servicios',
    '@ami/mod-validacion',
  ],
};

module.exports = withPWA(nextConfig);
