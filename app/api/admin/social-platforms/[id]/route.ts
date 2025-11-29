import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { socialPlatforms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export const runtime = 'nodejs';

// PUT: 更新社交媒体平台
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const body = await request.json();
    const { name, iconType, iconSvg, iconImage, iconEmoji, url, sortOrder, isActive } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Platform name is required" }, { status: 400 });
    }

    // 验证 iconType
    if (iconType && !["svg", "image", "emoji"].includes(iconType)) {
      return NextResponse.json({ error: "Invalid iconType. Must be 'svg', 'image', or 'emoji'" }, { status: 400 });
    }

    const result = await db
      .update(socialPlatforms)
      .set({
        name: name.trim(),
        iconType: iconType || "svg",
        iconSvg: iconSvg && iconSvg.trim() !== "" ? iconSvg.trim() : null,
        iconImage: iconImage && iconImage.trim() !== "" ? iconImage.trim() : null,
        iconEmoji: iconEmoji && iconEmoji.trim() !== "" ? iconEmoji.trim() : null,
        url: url && url.trim() !== "" ? url.trim() : null,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        updatedAt: new Date(),
      })
      .where(eq(socialPlatforms.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Platform not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    
    // 提供更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error updating social platform:", error);
    
    // 检查是否是数据库约束错误
    if (errorMessage.includes("UNIQUE constraint") || errorMessage.includes("unique")) {
      return NextResponse.json({ error: "A platform with this name already exists" }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to update social platform",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

// DELETE: 删除社交媒体平台
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id } = await params;

    await db.delete(socialPlatforms).where(eq(socialPlatforms.id, parseInt(id)));

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting social platform:", error);
    return NextResponse.json({ error: "Failed to delete social platform" }, { status: 500 });
  }
}

