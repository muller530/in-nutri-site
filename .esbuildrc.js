// esbuild 配置，用于 @cloudflare/next-on-pages
// 将 better-sqlite3 标记为外部，避免打包
module.exports = {
  external: ["better-sqlite3", "drizzle-orm/better-sqlite3"],
};






