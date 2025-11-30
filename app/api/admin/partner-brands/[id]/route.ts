import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partnerBrands } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// 更新合作品牌
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { data: null, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, logoUrl, websiteUrl, sortOrder, isActive } = body;

    const updated = await db
      .update(partnerBrands)
      .set({
        name,
        logoUrl,
        websiteUrl: websiteUrl || null,
        sortOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(partnerBrands.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { data: null, error: "Partner brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated[0], error: null });
  } catch (error) {
    console.error("Error updating partner brand:", error);
    return NextResponse.json(
      { data: null, error: "Failed to update partner brand" },
      { status: 500 }
    );
  }
}

// 删除合作品牌
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { data: null, error: "Invalid ID" },
        { status: 400 }
      );
    }

    await db.delete(partnerBrands).where(eq(partnerBrands.id, id));

    return NextResponse.json({ data: { id }, error: null });
  } catch (error) {
    console.error("Error deleting partner brand:", error);
    return NextResponse.json(
      { data: null, error: "Failed to delete partner brand" },
      { status: 500 }
    );
  }
}

