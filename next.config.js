/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // EdgeOne 部署时，禁用图片优化，直接使用原始图片
    // 这样可以避免图片路径问题
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Cloudflare Pages 适配
  // 使用 @cloudflare/next-on-pages 适配器
  webpack: (config, { isServer }) => {
    // 在 Edge Runtime 中，将 better-sqlite3 及其依赖标记为外部
    if (isServer) {
      config.externals = config.externals || [];
      // 将 better-sqlite3 标记为外部，避免在 Edge Runtime 中打包
      config.externals.push({
        "better-sqlite3": "commonjs better-sqlite3",
        "drizzle-orm/better-sqlite3": "commonjs drizzle-orm/better-sqlite3",
      });
    }
    
    
    return config;
  },
};

module.exports = nextConfig;

