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
    
    // 解决 redi 库重复加载问题
    // 确保 redi 只被加载一次（通过单例模式）
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      // 使用 resolve.fallback 确保 redi 只被解析一次
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }
    
    // 使用 optimization 来确保 redi 只被打包一次
    if (!isServer && config.optimization) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          redi: {
            name: 'redi',
            test: /[\\/]node_modules[\\/]redi[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;

