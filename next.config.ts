/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Railway production
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['professional-videos-downloader-production.up.railway.app'], // Fix cross-origin warning
  env: {
    RAILWAY_ENV: 'production', // Real downloads
  },
};

module.exports = nextConfig;