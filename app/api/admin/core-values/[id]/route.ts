import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coreValues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// PUT: 更新核心价值
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
    const { number, title, hashtag, sortOrder, isActive } = body;

    const updated = await db
      .update(coreValues)
      .set({
        number,
        title,
        hashtag,
        sortOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(coreValues.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ data: null, error: "Core value not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated[0], error: null });
  } catch (error) {
    console.error("Error updating core value:", error);
    return NextResponse.json({ data: null, error: "Failed to update core value" }, { status: 500 });
  }
}

// DELETE: 删除核心价值
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

    await db.delete(coreValues).where(eq(coreValues.id, parseInt(id)));

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("Error deleting core value:", error);
    return NextResponse.json({ data: null, error: "Failed to delete core value" }, { status: 500 });
  }
}

