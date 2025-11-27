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
  // 使用 @cloudflare/next-on-pages 适配器
};

module.exports = nextConfig;

