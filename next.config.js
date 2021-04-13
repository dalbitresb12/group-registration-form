const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  images: {
    domains: JSON.parse(process.env.STATIC_CONTENT_DOMAIN),
  },
  productionBrowserSourceMaps: process.env.PRODUCTION_SOURCE_MAPS === "true",
});
