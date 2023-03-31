module.exports = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: [
      "brandlogos.net",
      "robohash.org",
      "seeklogo.com",
      "cdn.discordapp.com",
      "media.discordapp.net",
      "static.tvtropes.org",
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};
