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

