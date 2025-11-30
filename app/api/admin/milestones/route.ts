import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { desc } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// GET: 获取所有里程碑（管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const milestonesList = await db
      .select()
      .from(milestones)
      .orderBy(milestones.sortOrder, desc(milestones.createdAt));

    return NextResponse.json({ data: milestonesList, error: null });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch milestones" }, { status: 500 });
  }
}

// POST: 创建新的里程碑
export async function POST(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

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

    const newMilestone = await db
      .insert(milestones)
      .values({
        year: processedYear,
        month: processedMonth,
        title: title.trim(),
        description: processedDescription,
        color: processedColor,
        icon: processedIcon,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .returning();

    return NextResponse.json({ data: newMilestone[0], error: null });
  } catch (error: any) {
    console.error("Error creating milestone:", error);
    const errorMessage = error?.message || "Failed to create milestone";
    return NextResponse.json({ 
      data: null, 
      error: `Failed to create milestone: ${errorMessage}` 
    }, { status: 500 });
  }
}

