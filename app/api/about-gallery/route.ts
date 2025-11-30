import { NextResponse } from "next/server";
import { db } from "@/db";
import { aboutGallery } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const runtime = 'nodejs';

// GET: 获取所有活跃的关于我们图片（公开）
export async function GET() {
  try {
    const gallery = await db
      .select()
      .from(aboutGallery)
      .where(eq(aboutGallery.isActive, true))
      .orderBy(asc(aboutGallery.sortOrder));
    
    return NextResponse.json({ data: gallery, error: null });
  } catch (error) {
    console.error("Error fetching about gallery:", error);
    return NextResponse.json({ 
      data: null, 
      error: "Failed to fetch about gallery" 
    }, { status: 500 });
  }
}

