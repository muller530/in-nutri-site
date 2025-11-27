/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Cloudflare Pages 适配
  // 注意：Cloudflare Pages 使用 Edge Runtime，某些 Node.js API 可能不可用
  experimental: {
    // 如果需要使用 Edge Runtime，可以启用
    // runtime: 'edge',
  },
};

module.exports = nextConfig;

