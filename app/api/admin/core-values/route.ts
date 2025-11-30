import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coreValues } from "@/db/schema";
import { desc } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// GET: 获取所有核心价值（管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const values = await db
      .select()
      .from(coreValues)
      .orderBy(coreValues.sortOrder, desc(coreValues.createdAt));

    return NextResponse.json({ data: values, error: null });
  } catch (error) {
    console.error("Error fetching core values:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch core values" }, { status: 500 });
  }
}

// POST: 创建新的核心价值
export async function POST(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { number, title, hashtag, sortOrder, isActive } = body;

    if (!title) {
      return NextResponse.json({ data: null, error: "Title is required" }, { status: 400 });
    }

    const newValue = await db
      .insert(coreValues)
      .values({
        number: number || null,
        title,
        hashtag: hashtag || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json({ data: newValue[0], error: null });
  } catch (error) {
    console.error("Error creating core value:", error);
    return NextResponse.json({ data: null, error: "Failed to create core value" }, { status: 500 });
  }
}

