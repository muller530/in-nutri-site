import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { navigationItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const id = parseInt(params.id);
    const item = await db
      .select()
      .from(navigationItems)
      .where(eq(navigationItems.id, id))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { error: "导航项不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching navigation item:", error);
    return NextResponse.json(
      { error: "获取导航项失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const id = parseInt(params.id);
    const body = await request.json();

    const updateData: any = {};
    if (body.label !== undefined) updateData.label = body.label;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.pageType !== undefined) updateData.pageType = body.pageType;
    if (body.pageSlug !== undefined) updateData.pageSlug = body.pageSlug;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.parentId !== undefined) updateData.parentId = body.parentId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.openInNewTab !== undefined) updateData.openInNewTab = body.openInNewTab;
    updateData.updatedAt = new Date();

    const result = await db
      .update(navigationItems)
      .set(updateData)
      .where(eq(navigationItems.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "导航项不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error updating navigation item:", error);
    return NextResponse.json(
      { error: "更新导航项失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const id = parseInt(params.id);

    // 检查是否有子菜单
    const children = await db
      .select()
      .from(navigationItems)
      .where(eq(navigationItems.parentId, id));

    if (children.length > 0) {
      return NextResponse.json(
        { error: "无法删除：该菜单项包含子菜单，请先删除子菜单" },
        { status: 400 }
      );
    }

    await db.delete(navigationItems).where(eq(navigationItems.id, id));

    return NextResponse.json({ data: { id }, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting navigation item:", error);
    return NextResponse.json(
      { error: "删除导航项失败" },
      { status: 500 }
    );
  }
}

