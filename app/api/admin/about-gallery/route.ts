import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aboutGallery } from "@/db/schema";
import { desc } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// GET: 获取所有关于我们图片（管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const gallery = await db
      .select()
      .from(aboutGallery)
      .orderBy(aboutGallery.sortOrder, desc(aboutGallery.createdAt));

    return NextResponse.json({ data: gallery, error: null });
  } catch (error) {
    console.error("Error fetching about gallery:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch about gallery" }, { status: 500 });
  }
}

// POST: 创建新的图片
export async function POST(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, alt, sortOrder, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json({ data: null, error: "Image URL is required" }, { status: 400 });
    }

    const newImage = await db
      .insert(aboutGallery)
      .values({
        imageUrl,
        alt: alt || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json({ data: newImage[0], error: null });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return NextResponse.json({ data: null, error: "Failed to create gallery image" }, { status: 500 });
  }
}

