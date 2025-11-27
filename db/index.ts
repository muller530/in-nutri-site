import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { createD1Database } from "./cloudflare";

type DbType = ReturnType<typeof drizzle> | ReturnType<typeof createD1Database>;

let dbInstance: DbType | null = null;

// 延迟初始化数据库连接
function getDbInstance(): DbType {
  if (dbInstance) {
    return dbInstance;
  }

  // 检测运行环境
  // 关键：构建时（Next.js build）永远不使用 D1，即使检测到环境变量
  // 只有在实际运行时（请求处理时）才检测 D1 绑定
  // 通过检查是否有实际的 D1 绑定对象来判断，而不是环境变量
  const hasD1Binding = typeof (globalThis as any).DB !== "undefined" && (globalThis as any).DB !== null;
  
  // 只有在有实际 D1 绑定时才使用 D1（这意味着在运行时）
  if (hasD1Binding) {
    // Cloudflare 运行时环境：使用 D1
    const d1Database = (globalThis as any).DB;
    dbInstance = createD1Database(d1Database);
  } else {
    // 本地开发环境或构建时：使用 SQLite
    // 构建时如果 SQLite 文件不存在，创建一个内存数据库作为占位符
    try {
      const dbPath = process.env.DATABASE_URL || "./db/sqlite.db";
      const sqlite = new Database(dbPath);
      sqlite.pragma("journal_mode = WAL");
      dbInstance = drizzle(sqlite, { schema });
    } catch (error) {
      // 构建时如果无法创建 SQLite 连接（文件不存在等），使用内存数据库
      // 这允许构建继续进行，但运行时需要正确的数据库配置
      console.warn("Using in-memory database for build:", error);
      const sqlite = new Database(":memory:");
      sqlite.pragma("journal_mode = WAL");
      dbInstance = drizzle(sqlite, { schema });
    }
  }

  return dbInstance;
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

