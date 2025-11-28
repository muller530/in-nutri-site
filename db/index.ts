// 使用动态导入避免在 Edge Runtime 中加载 better-sqlite3
import * as schema from "./schema";

type DbType = any;

let dbInstance: DbType | null = null;

// 检测是否在 Edge Runtime 中（构建时或 Cloudflare 运行时）
function isEdgeRuntime(): boolean {
  // 检查是否有 D1 绑定（Cloudflare 环境）
  if (typeof (globalThis as any).DB !== "undefined" && (globalThis as any).DB !== null) {
    return true;
  }
  // 检查是否在构建时（Next.js build）
  // 在构建时，假设是 Edge Runtime（避免导入 better-sqlite3）
  return typeof process === "undefined" || 
         process.env.NEXT_PHASE === "phase-production-build" ||
         (process.env.NODE_ENV === "production" && !process.env.CF_PAGES_BRANCH);
}

// 延迟初始化数据库连接
function getDbInstance(): DbType {
  if (dbInstance) {
    return dbInstance;
  }

  // 如果在 Edge Runtime 中，使用 D1
  if (isEdgeRuntime()) {
    // Cloudflare 运行时环境：使用 D1
    try {
      // 使用 require 动态加载，避免构建时导入
      const cloudflareModule = require("./cloudflare");
      const d1Database = (globalThis as any).DB;
      dbInstance = cloudflareModule.createD1Database(d1Database);
      return dbInstance;
    } catch (error) {
      // 在构建时，如果无法加载 D1，创建一个占位符对象
      // 这允许构建继续进行
      console.warn("D1 not available, using placeholder:", error);
      // 返回一个占位符对象，避免构建失败
      dbInstance = {
        select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
        insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
        update: () => ({ set: () => ({ where: () => Promise.resolve([]) }) }),
        delete: () => ({ where: () => Promise.resolve([]) }),
      };
      return dbInstance;
    }
  }

  // 本地开发环境：使用 SQLite
  // 使用 require 而不是 import，避免在 Edge Runtime 中被分析
  try {
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const Database = require("better-sqlite3");
    const dbPath = process.env.DATABASE_URL || "./db/sqlite.db";
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    dbInstance = drizzle(sqlite, { schema });
    return dbInstance;
  } catch (error) {
    // 如果无法创建 SQLite 连接，使用内存数据库
    console.warn("Using in-memory database:", error);
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const Database = require("better-sqlite3");
    const sqlite = new Database(":memory:");
    sqlite.pragma("journal_mode = WAL");
    dbInstance = drizzle(sqlite, { schema });
    return dbInstance;
  }
}

// 导出代理对象，延迟初始化
export const db = new Proxy({} as DbType, {
  get(_target, prop) {
    const actualDb = getDbInstance();
    const value = (actualDb as any)[prop];
    if (typeof value === "function") {
      return value.bind(actualDb);
    }
    return value;
  },
});

