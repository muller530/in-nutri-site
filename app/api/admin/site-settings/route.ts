import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { siteSettings } from "@/db/schema";

import { requireAdmin } from "@/lib/auth";

import { z } from "zod";

import { eq } from "drizzle-orm";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
const updateSiteSettingsSchema = z.object({
  douyinUrl: z.string().url().optional().or(z.literal("")),
  xiaohongshuUrl: z.string().url().optional().or(z.literal("")),
  tmallUrl: z.string().url().optional().or(z.literal("")),
  jdUrl: z.string().url().optional().or(z.literal("")),
  qualityReportUrl: z.string().optional(),
});

// GET: 获取站点设置（管理员）
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const settings = await db.select().from(siteSettings).limit(1);
    if (settings.length === 0) {
      // 创建默认设置
      const defaultSettings = await db
        .insert(siteSettings)
        .values({
          douyinUrl: null,
          xiaohongshuUrl: null,
          tmallUrl: null,
          jdUrl: null,
          qualityReportUrl: null,
        })
        .returning();
      return NextResponse.json({ data: defaultSettings[0], error: null });
    }
    return NextResponse.json({ data: settings[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching site settings:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch site settings" }, { status: 500 });
  }
}

// PUT: 更新站点设置（管理员）
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validated = updateSiteSettingsSchema.parse(body);

    // 检查是否存在设置
    const existing = await db.select().from(siteSettings).limit(1);

    let result;
    if (existing.length === 0) {
      // 创建新设置
      result = await db
        .insert(siteSettings)
        .values({
          ...validated,
          douyinUrl: validated.douyinUrl || null,
          xiaohongshuUrl: validated.xiaohongshuUrl || null,
          tmallUrl: validated.tmallUrl || null,
          jdUrl: validated.jdUrl || null,
        })
        .returning();
    } else {
      // 更新现有设置
      result = await db
        .update(siteSettings)
        .set({
          ...validated,
          douyinUrl: validated.douyinUrl || null,
          xiaohongshuUrl: validated.xiaohongshuUrl || null,
          tmallUrl: validated.tmallUrl || null,
          jdUrl: validated.jdUrl || null,
          qualityReportUrl: validated.qualityReportUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, existing[0].id))
        .returning();
    }

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error updating site settings:", error);
    return NextResponse.json({ data: null, error: "Failed to update site settings" }, { status: 500 });
  }
}

