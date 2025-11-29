import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { socialPlatforms } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const runtime = 'nodejs';

// GET: 获取所有活跃的社交媒体平台（公开）
export async function GET() {
  try {
    const platforms = await db
      .select()
      .from(socialPlatforms)
      .where(eq(socialPlatforms.isActive, true))
      .orderBy(asc(socialPlatforms.sortOrder));
    
    return NextResponse.json({ data: platforms, error: null });
  } catch (error) {
    console.error("Error fetching social platforms:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch social platforms" }, { status: 500 });
  }
}

