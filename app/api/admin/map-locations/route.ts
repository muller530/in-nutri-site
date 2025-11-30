import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mapLocations } from "@/db/schema";
import { desc } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// GET: 获取所有地图位置（管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const locations = await db
      .select()
      .from(mapLocations)
      .orderBy(mapLocations.sortOrder, desc(mapLocations.createdAt));

    return NextResponse.json({ data: locations, error: null });
  } catch (error) {
    console.error("Error fetching map locations:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch map locations" }, { status: 500 });
  }
}

// POST: 创建新的地图位置
export async function POST(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, label, latitude, longitude, color, sortOrder, isActive } = body;

    if (!name || !latitude || !longitude) {
      return NextResponse.json({ data: null, error: "Name, latitude and longitude are required" }, { status: 400 });
    }

    const newLocation = await db
      .insert(mapLocations)
      .values({
        name,
        label: label || null,
        latitude,
        longitude,
        color: color || "#7C3AED",
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json({ data: newLocation[0], error: null });
  } catch (error) {
    console.error("Error creating map location:", error);
    return NextResponse.json({ data: null, error: "Failed to create map location" }, { status: 500 });
  }
}

