import { NextResponse } from "next/server";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const runtime = 'nodejs';

// GET: 获取所有活跃的里程碑（公开）
export async function GET() {
  try {
    const milestonesList = await db
      .select()
      .from(milestones)
      .where(eq(milestones.isActive, true))
      .orderBy(asc(milestones.sortOrder));
    
    return NextResponse.json({ data: milestonesList, error: null });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json({ 
      data: null, 
      error: "Failed to fetch milestones" 
    }, { status: 500 });
  }
}

