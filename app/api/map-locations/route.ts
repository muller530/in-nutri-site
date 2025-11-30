import { NextResponse } from "next/server";
import { db } from "@/db";
import { mapLocations } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const runtime = 'nodejs';

// GET: 获取所有活跃的地图位置（公开）
export async function GET() {
  try {
    const locations = await db
      .select()
      .from(mapLocations)
      .where(eq(mapLocations.isActive, true))
      .orderBy(asc(mapLocations.sortOrder));
    
    return NextResponse.json({ data: locations, error: null });
  } catch (error) {
    console.error("Error fetching map locations:", error);
    return NextResponse.json({ 
      data: null, 
      error: "Failed to fetch map locations" 
    }, { status: 500 });
  }
}

