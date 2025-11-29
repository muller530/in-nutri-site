import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { navigationItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const items = await db
      .select()
      .from(navigationItems)
      .orderBy(asc(navigationItems.sortOrder), asc(navigationItems.position));

    return NextResponse.json({ data: items, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching navigation items:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch navigation items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const {
      label,
      url,
      type = "link",
      pageType,
      pageSlug,
      position = "left",
      sortOrder = 0,
      parentId,
      isActive = true,
      openInNewTab = false,
    } = body;

    if (!label) {
      return NextResponse.json(
        { error: "标签不能为空" },
        { status: 400 }
      );
    }

    const result = await db.insert(navigationItems).values({
      label,
      url: url || null,
      type,
      pageType: pageType || null,
      pageSlug: pageSlug || null,
      position,
      sortOrder,
      parentId: parentId || null,
      isActive,
      openInNewTab,
    }).returning();

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error creating navigation item:", error);
    return NextResponse.json(
      { error: "创建导航项失败" },
      { status: 500 }
    );
  }
}

