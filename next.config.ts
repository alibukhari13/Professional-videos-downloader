/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Render
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    RENDER_ENV: 'production', // Force real downloads
  },
};

module.exports = nextConfig;