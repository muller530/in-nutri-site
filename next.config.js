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
  // 移除 standalone 模式，使用默认输出
  // Cloudflare Pages 会自动处理 Next.js 构建输出
};

module.exports = nextConfig;

