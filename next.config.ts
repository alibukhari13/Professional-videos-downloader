/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export enable
  trailingSlash: true, // URLs mein / add karo for static
  images: {
    unoptimized: true, // Images ko optimize na karo for static
  },
  turbopack: {
    root: process.cwd(),
  },
};

module.exports = nextConfig;