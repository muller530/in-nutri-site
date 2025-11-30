import { NextResponse } from "next/server";
import { db } from "@/db";
import { coreValues } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const runtime = 'nodejs';

// GET: 获取所有活跃的核心价值（公开）
export async function GET() {
  try {
    const values = await db
      .select()
      .from(coreValues)
      .where(eq(coreValues.isActive, true))
      .orderBy(asc(coreValues.sortOrder));
    
    return NextResponse.json({ data: values, error: null });
  } catch (error) {
    console.error("Error fetching core values:", error);
    return NextResponse.json({ 
      data: null, 
      error: "Failed to fetch core values" 
    }, { status: 500 });
  }
}

