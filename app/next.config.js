const withPlugins = require('next-compose-plugins');
const withOptimizedImages = require('next-optimized-images');

const nextConfig = {
  images: {
    // ? while next-optimized-images is part of the setup, this setting has to be disabled
    disableStaticImages: true,
  },
  async redirects() {
    const redirects = [];

    if (process.env.ENABLE_MAINTENANCE_MODE === 'true') {
      redirects.push({
        source: '/:path((?!maintenance$|_next/|fonts/|api/|manifest|favicon).*)',
        destination: '/maintenance',
        permanent: false,
      });
    } else {
      redirects.push({
        source: '/maintenance',
        destination: '/',
        permanent: false,
      });
    }

    return redirects;
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
