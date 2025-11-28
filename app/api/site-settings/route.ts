import { NextResponse } from "next/server";

import { db } from "@/db";

import { siteSettings } from "@/db/schema";

// 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export const runtime = 'nodejs';
// GET: 获取站点设置（公开）
export async function GET() {
  try {
    const settings = await db.select().from(siteSettings).limit(1);
    if (settings.length === 0) {
      // 如果没有设置，返回默认空值
      return NextResponse.json({
        data: {
          douyinUrl: null,
          xiaohongshuUrl: null,
          tmallUrl: null,
          jdUrl: null,
          qualityReportUrl: null,
        },
        error: null,
      });
    }
    return NextResponse.json({ data: settings[0], error: null });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch site settings" }, { status: 500 });
  }
}

