/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "http://localhost:3000",

  generateRobotsTxt: true,

  exclude: [
    "/twitter-image.*",
    "/opengraph-image.*",
    "/icon.*",
    "/api/*",
    "/dashboard/*",
    "/admin/*",
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/"],
      },
    ],
  },
};