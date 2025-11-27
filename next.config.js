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
  // Next.js 16 在 Cloudflare Pages 上需要输出为 standalone
  output: 'standalone',
  // 禁用静态优化，因为我们需要服务器端渲染
  // 但 Cloudflare Pages 支持 Edge Runtime
  experimental: {
    // 如果需要使用 Edge Runtime，可以启用
    // runtime: 'edge',
  },
};

module.exports = nextConfig;

