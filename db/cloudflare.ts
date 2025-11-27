// Cloudflare D1 数据库适配器
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// 在 Cloudflare Pages/Workers 环境中使用
export function createD1Database(d1Database: any) {
  return drizzle(d1Database, { schema });
}

export type CloudflareDB = ReturnType<typeof createD1Database>;

