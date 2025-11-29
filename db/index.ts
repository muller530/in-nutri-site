// 使用动态导入避免在 Edge Runtime 中加载 better-sqlite3
import * as schema from "./schema";

type DbType = any;

let dbInstance: DbType | null = null;

// 检测是否在 Edge Runtime 或 EdgeOne 环境中
function isEdgeRuntime(): boolean {
  // 检查是否有 D1 绑定（Cloudflare 环境）
  if (typeof globalThis !== "undefined" && (globalThis as any).DB !== undefined && (globalThis as any).DB !== null) {
    return true;
  }
  
  // 检查是否是 EdgeOne 环境（优先检测）
  if (process.env.EDGEONE_DEPLOY === "true" || process.env.EDGEONE_URL) {
    // EdgeOne 不支持文件系统，需要使用云数据库
    return true;
  }
  
  // 检查是否在构建时（Next.js build）
  const isBuildTime = typeof process === "undefined" || 
         (process.env.NEXT_PHASE === "phase-production-build" && !process.env.DATABASE_URL) ||
         (process.env.NODE_ENV === "production" && !process.env.CF_PAGES_BRANCH && !process.env.DATABASE_URL);
  return isBuildTime;
}

// 检测是否是 EdgeOne 环境
function isEdgeOneEnvironment(): boolean {
  // 检查环境变量
  if (process.env.EDGEONE_DEPLOY === "true" || !!process.env.EDGEONE_URL) {
    return true;
  }
  
  // 如果环境变量未设置，尝试通过检测文件系统来判断
  // EdgeOne 环境通常不支持文件系统写入
  try {
    // 检查是否在 Edge Runtime 中（EdgeOne 使用 Edge Runtime）
    if (typeof process === "undefined" || typeof require === "undefined") {
      // 如果在 Edge Runtime 中且没有 D1 绑定，可能是 EdgeOne
      if (typeof globalThis !== "undefined" && (globalThis as any).DB === undefined) {
        return true;
      }
    }
  } catch {
    // 如果检测失败，假设不是 EdgeOne
  }
  
  return false;
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
        console.log("✅ 使用 D1 数据库");
        dbInstance = cloudflareModule.createD1Database(d1Database);
        return dbInstance;
      } else {
        // EdgeOne 环境中，如果没有 D1，应该抛出错误而不是使用占位符
        if (isEdgeOneEnvironment()) {
          const errorMsg = "EdgeOne 环境不支持 SQLite，请配置云数据库（MySQL/PostgreSQL）或使用腾讯云服务器部署";
          console.error("❌ EdgeOne 环境：D1 数据库绑定未找到");
          console.error("💡 解决方案：");
          console.error("   1. 使用腾讯云 MySQL/PostgreSQL 数据库");
          console.error("   2. 在 EdgeOne 环境变量中设置 DATABASE_URL（MySQL/PostgreSQL 连接字符串）");
          console.error("   3. 或使用腾讯云轻量应用服务器部署（支持 SQLite）");
          // 创建一个会抛出错误的占位符对象
          dbInstance = {
            select: () => ({ 
              from: () => ({ 
                where: () => Promise.reject(new Error(errorMsg)),
                limit: () => Promise.reject(new Error(errorMsg)),
                orderBy: () => Promise.reject(new Error(errorMsg)),
                all: () => Promise.reject(new Error(errorMsg)),
              }),
            }),
            insert: () => ({ 
              values: () => ({ 
                returning: () => Promise.reject(new Error(errorMsg)) 
              }) 
            }),
            update: () => ({ 
              set: () => ({ 
                where: () => Promise.reject(new Error(errorMsg)) 
              }) 
            }),
            delete: () => ({ 
              where: () => Promise.reject(new Error(errorMsg)) 
            }),
          };
          return dbInstance;
        } else {
          console.warn("⚠️ D1 数据库绑定未找到，使用占位符（仅构建时）");
        }
      }
    } catch (error) {
      console.error("加载 D1 适配器失败:", error);
      if (isEdgeOneEnvironment()) {
        const errorMsg = "EdgeOne 环境不支持 SQLite，请配置云数据库（MySQL/PostgreSQL）或使用腾讯云服务器部署";
        console.error("❌ EdgeOne 环境不支持 SQLite，请配置云数据库");
        // 创建一个会抛出错误的占位符对象
        dbInstance = {
          select: () => ({ 
            from: () => ({ 
              where: () => Promise.reject(new Error(errorMsg)),
              limit: () => Promise.reject(new Error(errorMsg)),
              orderBy: () => Promise.reject(new Error(errorMsg)),
              all: () => Promise.reject(new Error(errorMsg)),
            }),
          }),
          insert: () => ({ 
            values: () => ({ 
              returning: () => Promise.reject(new Error(errorMsg)) 
            }) 
          }),
          update: () => ({ 
            set: () => ({ 
              where: () => Promise.reject(new Error(errorMsg)) 
            }) 
          }),
          delete: () => ({ 
            where: () => Promise.reject(new Error(errorMsg)) 
          }),
        };
        return dbInstance;
      }
    }
    // 在构建时（非 EdgeOne）或 D1 不可用时，创建一个占位符对象
    // 这允许构建继续进行，但查询会返回空数组
    // 注意：仅在构建时使用，运行时应该使用真实的数据库
    dbInstance = {
      select: () => ({ 
        from: () => ({ 
          where: () => Promise.resolve([]),
          limit: () => Promise.resolve([]),
          orderBy: () => Promise.resolve([]),
          all: () => Promise.resolve([]),
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

  // 本地开发环境或腾讯云部署：使用 SQLite
  // 只有在非 Edge Runtime 时才执行这段代码
  // 在 Node.js runtime 中，require 是可用的
  try {
    // 再次检查是否是 EdgeOne 环境（双重保险）
    if (isEdgeOneEnvironment()) {
      console.error("❌ EdgeOne 环境不支持 SQLite 文件系统");
      console.error("💡 解决方案：");
      console.error("   1. 使用腾讯云 MySQL/PostgreSQL 数据库");
      console.error("   2. 在 EdgeOne 环境变量中设置 DATABASE_URL（MySQL/PostgreSQL 连接字符串）");
      console.error("   3. 或使用腾讯云轻量应用服务器部署（支持 SQLite）");
      throw new Error("EdgeOne 不支持 SQLite，请配置云数据库或使用腾讯云服务器部署");
    }
    
    // 在 Node.js runtime 中，直接使用 require
    if (typeof require === "undefined") {
      throw new Error("require is not available in this environment");
    }
    
    const drizzleModule = require("drizzle-orm/better-sqlite3");
    const Database = require("better-sqlite3");
    
    const { drizzle } = drizzleModule;
    const dbPath = process.env.DATABASE_URL || "./db/sqlite.db";
    
    // 尝试创建 SQLite 连接
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    dbInstance = drizzle(sqlite, { schema });
    console.log("✅ 使用 SQLite 数据库:", dbPath);
    return dbInstance;
  } catch (error: any) {
    // 检查错误是否是文件系统相关（EdgeOne 不支持文件系统）
    const errorMessage = error?.message || String(error);
    const isFileSystemError = errorMessage.includes("ENOENT") || 
                             errorMessage.includes("EACCES") ||
                             errorMessage.includes("文件系统") ||
                             errorMessage.includes("filesystem") ||
                             errorMessage.includes("SQLite") ||
                             (error?.code && (error.code === "ENOENT" || error.code === "EACCES"));
    
    // 如果是 EdgeOne 环境或文件系统错误，提供明确的错误信息
    if (isEdgeOneEnvironment() || isFileSystemError || errorMessage.includes("EdgeOne")) {
      console.error("❌ EdgeOne 环境不支持 SQLite 文件系统");
      console.error("💡 解决方案：");
      console.error("   1. 使用腾讯云 MySQL/PostgreSQL 数据库");
      console.error("   2. 在 EdgeOne 环境变量中设置 DATABASE_URL（MySQL/PostgreSQL 连接字符串）");
      console.error("   3. 或使用腾讯云轻量应用服务器部署（支持 SQLite）");
      throw new Error("EdgeOne 不支持 SQLite，请配置云数据库或使用腾讯云服务器部署");
    }
    
    // 如果无法创建 SQLite 连接，尝试使用内存数据库（仅开发环境）
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ SQLite 文件连接失败，尝试使用内存数据库:", error?.message);
      try {
        const drizzleModule = require("drizzle-orm/better-sqlite3");
        const Database = require("better-sqlite3");
        
        const { drizzle } = drizzleModule;
        const sqlite = new Database(":memory:");
        sqlite.pragma("journal_mode = WAL");
        dbInstance = drizzle(sqlite, { schema });
        console.log("⚠️ 使用内存数据库（数据不会持久化）");
        return dbInstance;
      } catch (innerError) {
        console.error("创建内存数据库失败:", innerError);
        throw innerError;
      }
    } else {
      // 生产环境，直接抛出错误
      console.error("❌ 数据库连接失败:", error?.message || error);
      throw error;
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

