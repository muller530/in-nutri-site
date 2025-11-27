import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { createD1Database } from "./cloudflare";

// 检测运行环境
const isCloudflare = typeof (globalThis as any).DB !== "undefined" || process.env.CF_PAGES === "1";

let db: ReturnType<typeof drizzle> | ReturnType<typeof createD1Database>;

if (isCloudflare) {
  // Cloudflare 环境：使用 D1
  const d1Database = (globalThis as any).DB;
  if (!d1Database) {
    throw new Error("D1 database binding not found. Make sure 'DB' is configured in wrangler.toml");
  }
  db = createD1Database(d1Database);
} else {
  // 本地开发环境：使用 SQLite
  const sqlite = new Database(process.env.DATABASE_URL || "./db/sqlite.db");
  sqlite.pragma("journal_mode = WAL");
  db = drizzle(sqlite, { schema });
}

export { db };

