import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partnerBrands } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = 'nodejs';

// 获取所有激活的合作品牌
export async function GET(request: NextRequest) {
  try {
    const brands = await db
      .select()
      .from(partnerBrands)
      .where(eq(partnerBrands.isActive, true))
      .orderBy(partnerBrands.sortOrder, desc(partnerBrands.createdAt));

    return NextResponse.json({ data: brands, error: null });
  } catch (error) {
    console.error("Error fetching partner brands:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch partner brands" },
      { status: 500 }
    );
  }
}



