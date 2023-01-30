const withPlugins = require('next-compose-plugins');
const withOptimizedImages = require('next-optimized-images');

const nextConfig = {
  webpack: (config) => {
    config.node = {
      fs: 'empty',
    };

    return config;
  },
  async redirects() {
    return [
      ...process.env.MAINTENANCE === 'true' ? [
        {
          source: '/:path((?!maintenance$|_next/|fonts/|api/|manifest|favicon).*)',
          destination: '/maintenance',
          permanent: false,
        },
      ] : [],
    ];
  },
};

module.exports = withPlugins(
  [
    withOptimizedImages({
      optimizeImages: false,
    }),
  ],
  nextConfig,
);
