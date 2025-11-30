import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mapLocations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// PUT: 更新地图位置
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, label, latitude, longitude, color, sortOrder, isActive } = body;

    const updated = await db
      .update(mapLocations)
      .set({
        name,
        label,
        latitude,
        longitude,
        color,
        sortOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(mapLocations.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ data: null, error: "Map location not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated[0], error: null });
  } catch (error) {
    console.error("Error updating map location:", error);
    return NextResponse.json({ data: null, error: "Failed to update map location" }, { status: 500 });
  }
}

// DELETE: 删除地图位置
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.delete(mapLocations).where(eq(mapLocations.id, parseInt(id)));

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("Error deleting map location:", error);
    return NextResponse.json({ data: null, error: "Failed to delete map location" }, { status: 500 });
  }
}

