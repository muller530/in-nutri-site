import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partnerBrands } from "@/db/schema";
import { desc } from "drizzle-orm";
import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'nodejs';

// 获取所有合作品牌（包括未激活的）
export async function GET(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allBrands = await db
      .select()
      .from(partnerBrands)
      .orderBy(partnerBrands.sortOrder, desc(partnerBrands.createdAt));

    return NextResponse.json({ data: allBrands, error: null });
  } catch (error) {
    console.error("Error fetching partner brands:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch partner brands" },
      { status: 500 }
    );
  }
}

// 创建新的合作品牌
export async function POST(request: NextRequest) {
  try {
    const session = await parseAdminFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, logoUrl, websiteUrl, sortOrder, isActive } = body;

    if (!name || !logoUrl) {
      return NextResponse.json(
        { data: null, error: "Name and logoUrl are required" },
        { status: 400 }
      );
    }

    const newBrand = await db
      .insert(partnerBrands)
      .values({
        name,
        logoUrl,
        websiteUrl: websiteUrl || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json({ data: newBrand[0], error: null });
  } catch (error) {
    console.error("Error creating partner brand:", error);
    return NextResponse.json(
      { data: null, error: "Failed to create partner brand" },
      { status: 500 }
    );
  }
}

