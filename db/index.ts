// 使用动态导入避免在 Edge Runtime 中加载 better-sqlite3
import * as schema from "./schema";

type DbType = any;

let dbInstance: DbType | null = null;

// 检测是否在 Edge Runtime 中（构建时或 Cloudflare 运行时）
function isEdgeRuntime(): boolean {
  // 检查是否有 D1 绑定（Cloudflare 环境）
  // 在 Cloudflare Pages 运行时，globalThis.DB 会被注入
  if (typeof globalThis !== "undefined" && (globalThis as any).DB !== undefined && (globalThis as any).DB !== null) {
    return true;
  }
  // 检查是否在构建时（Next.js build）
  // 在构建时，假设是 Edge Runtime（避免导入 better-sqlite3）
  // 但如果设置了 DATABASE_URL，说明是本地开发环境，应该使用 SQLite
  const isBuildTime = typeof process === "undefined" || 
         (process.env.NEXT_PHASE === "phase-production-build" && !process.env.DATABASE_URL) ||
         (process.env.NODE_ENV === "production" && !process.env.CF_PAGES_BRANCH && !process.env.DATABASE_URL);
  return isBuildTime;
}

// 延迟初始化数据库连接
function getDbInstance(): DbType {
  if (dbInstance) {
    return dbInstance;
  }

  const isEdge = isEdgeRuntime();

  // 如果在 Edge Runtime 中，使用 D1
  if (isEdge) {
    // Cloudflare 运行时环境：使用 D1
    try {
      // 使用动态 require，避免构建时导入
      const requireFunc = typeof require !== "undefined" ? require : (() => {
        throw new Error("require is not available");
      });
      const cloudflareModule = requireFunc("./cloudflare");
      const d1Database = (globalThis as any).DB;
      if (d1Database) {
        console.log("使用 D1 数据库");
        dbInstance = cloudflareModule.createD1Database(d1Database);
        return dbInstance;
      } else {
        console.warn("D1 数据库绑定未找到，使用占位符");
      }
    } catch (error) {
      console.error("加载 D1 适配器失败:", error);
    }
    // 在构建时或 D1 不可用时，创建一个占位符对象
    // 这允许构建继续进行，但查询会返回空数组
    dbInstance = {
      select: () => ({ 
        from: () => ({ 
          where: () => Promise.resolve([]),
          limit: () => Promise.resolve([]),
          orderBy: () => Promise.resolve([]),
        }),
      }),
      insert: () => ({ 
        values: () => ({ 
          returning: () => Promise.resolve([]) 
        }) 
      }),
      update: () => ({ 
        set: () => ({ 
          where: () => Promise.resolve([]) 
        }) 
      }),
      delete: () => ({ 
        where: () => Promise.resolve([]) 
      }),
    };
    return dbInstance;
  }

  // 本地开发环境：使用 SQLite
  // 只有在非 Edge Runtime 时才执行这段代码
  // 在 Node.js runtime 中，require 是可用的
  try {
    // 在 Node.js runtime 中，直接使用 require
    if (typeof require === "undefined") {
      throw new Error("require is not available in this environment");
    }
    
    const drizzleModule = require("drizzle-orm/better-sqlite3");
    const Database = require("better-sqlite3");
    
    const { drizzle } = drizzleModule;
    const dbPath = process.env.DATABASE_URL || "./db/sqlite.db";
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    dbInstance = drizzle(sqlite, { schema });
    console.log("使用 SQLite 数据库:", dbPath);
    return dbInstance;
  } catch (error) {
    // 如果无法创建 SQLite 连接，使用内存数据库
    console.warn("使用内存数据库:", error);
    try {
      const drizzleModule = require("drizzle-orm/better-sqlite3");
      const Database = require("better-sqlite3");
      
      const { drizzle } = drizzleModule;
      const sqlite = new Database(":memory:");
      sqlite.pragma("journal_mode = WAL");
      dbInstance = drizzle(sqlite, { schema });
      return dbInstance;
    } catch (innerError) {
      console.error("创建内存数据库失败:", innerError);
      throw innerError;
    }
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

