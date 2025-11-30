import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aboutUs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// GET: 获取关于我们的主信息（管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const about = await db.select().from(aboutUs).limit(1);
    return NextResponse.json({ 
      data: about[0] || null, 
      error: null 
    });
  } catch (error) {
    console.error("Error fetching about us:", error);
    return NextResponse.json({ 
      data: null, 
      error: "Failed to fetch about us" 
    }, { status: 500 });
  }
}

// PUT: 更新关于我们的主信息
export async function PUT(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { heroTitle, heroSubtitle, heroVideoUrl, missionTitle, missionContent, motto } = body;

    // 检查是否已存在记录
    const existing = await db.select().from(aboutUs).limit(1);
    
    if (existing.length > 0) {
      // 更新现有记录
      const updated = await db
        .update(aboutUs)
        .set({
          heroTitle,
          heroSubtitle,
          heroVideoUrl,
          missionTitle,
          missionContent,
          motto,
          updatedAt: new Date(),
        })
        .where(eq(aboutUs.id, existing[0].id))
        .returning();
      
      return NextResponse.json({ data: updated[0], error: null });
    } else {
      // 创建新记录
      const created = await db
        .insert(aboutUs)
        .values({
          heroTitle,
          heroSubtitle,
          heroVideoUrl,
          missionTitle,
          missionContent,
          motto,
        })
        .returning();
      
      return NextResponse.json({ data: created[0], error: null });
    }
  } catch (error) {
    console.error("Error updating about us:", error);
    return NextResponse.json({ 
      error: "Failed to update about us" 
    }, { status: 500 });
  }
}

