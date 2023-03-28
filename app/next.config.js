// const withPlugins = require('next-compose-plugins');
// const withOptimizedImages = require('next-optimized-images');

const nextConfig = {
  // webpack: (config) => {
  //   config.node = {
  //     fs: 'empty',
  //   };

  //   return config;
  // },
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

module.exports = nextConfig;

// module.exports = withPlugins(
//   [
//     withOptimizedImages({
//       optimizeImages: false,
//     }),
//   ],
//   nextConfig,
// );
