/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Railway
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    RAILWAY_ENV: 'production', // Real downloads
  },
};

module.exports = nextConfig;