module.exports = {
  siteUrl: `${process.env.VERCEL_URL}`,
  changefreq: 'daily',
  priority: 0.9,
  generateRobotsTxt: true,
  exclude: ['/projects', '/me'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://example.com/server-sitemap.xml', // <==== Add here
    ],
  },
};
