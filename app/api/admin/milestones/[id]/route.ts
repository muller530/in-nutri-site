import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// PUT: 更新里程碑
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
    const { year, month, title, description, color, icon, sortOrder, isActive } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json({ data: null, error: "Title is required" }, { status: 400 });
    }

    // 处理空字符串，转换为null
    const processedYear = year && year.trim() !== "" ? year.trim() : null;
    const processedMonth = month && month.trim() !== "" ? month.trim() : null;
    const processedDescription = description && description.trim() !== "" ? description.trim() : null;
    const processedIcon = icon && icon.trim() !== "" ? icon.trim() : null;
    const processedColor = color && color.trim() !== "" ? color.trim() : "#10B981";

    const updated = await db
      .update(milestones)
      .set({
        year: processedYear,
        month: processedMonth,
        title: title.trim(),
        description: processedDescription,
        color: processedColor,
        icon: processedIcon,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ data: null, error: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated[0], error: null });
  } catch (error: any) {
    console.error("Error updating milestone:", error);
    const errorMessage = error?.message || "Failed to update milestone";
    return NextResponse.json({ 
      data: null, 
      error: `Failed to update milestone: ${errorMessage}` 
    }, { status: 500 });
  }
}

// DELETE: 删除里程碑
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

    await db.delete(milestones).where(eq(milestones.id, parseInt(id)));

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json({ data: null, error: "Failed to delete milestone" }, { status: 500 });
  }
}

