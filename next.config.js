/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: '.next',
  exportPathMap: async function () {
    return {
      '/': { page: '/' }
    }
  }
}

module.exports = nextConfig 