import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aboutUs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = 'nodejs';

// GET: 获取关于我们的主信息（公开）
export async function GET() {
  try {
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

