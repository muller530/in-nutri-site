import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { socialPlatforms } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export const runtime = 'nodejs';

// GET: 获取所有社交媒体平台（管理员）
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const platforms = await db
      .select()
      .from(socialPlatforms)
      .orderBy(asc(socialPlatforms.sortOrder));
    
    return NextResponse.json({ data: platforms, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching social platforms:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch social platforms" }, { status: 500 });
  }
}

// POST: 创建新的社交媒体平台
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { name, iconType, iconSvg, iconImage, iconEmoji, url, sortOrder, isActive } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Platform name is required" }, { status: 400 });
    }

    // 验证 iconType
    if (iconType && !["svg", "image", "emoji"].includes(iconType)) {
      return NextResponse.json({ error: "Invalid iconType. Must be 'svg', 'image', or 'emoji'" }, { status: 400 });
    }

    const result = await db.insert(socialPlatforms).values({
      name: name.trim(),
      iconType: iconType || "svg",
      iconSvg: iconSvg && iconSvg.trim() !== "" ? iconSvg.trim() : null,
      iconImage: iconImage && iconImage.trim() !== "" ? iconImage.trim() : null,
      iconEmoji: iconEmoji && iconEmoji.trim() !== "" ? iconEmoji.trim() : null,
      url: url && url.trim() !== "" ? url.trim() : null,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    }).returning();

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    
    // 提供更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating social platform:", error);
    
    // 检查是否是数据库约束错误
    if (errorMessage.includes("UNIQUE constraint") || errorMessage.includes("unique")) {
      return NextResponse.json({ error: "A platform with this name already exists" }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create social platform",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

