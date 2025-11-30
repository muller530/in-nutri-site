import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aboutGallery } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// PUT: 更新图片
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
    const { imageUrl, alt, sortOrder, isActive } = body;

    const updated = await db
      .update(aboutGallery)
      .set({
        imageUrl,
        alt,
        sortOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(aboutGallery.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ data: null, error: "Gallery image not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated[0], error: null });
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return NextResponse.json({ data: null, error: "Failed to update gallery image" }, { status: 500 });
  }
}

// DELETE: 删除图片
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

    await db.delete(aboutGallery).where(eq(aboutGallery.id, parseInt(id)));

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json({ data: null, error: "Failed to delete gallery image" }, { status: 500 });
  }
}

