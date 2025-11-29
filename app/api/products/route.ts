import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { products } from "@/db/schema";

import { eq, and } from "drizzle-orm";

// 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const category = searchParams.get("category");

    // 构建查询条件
    const conditions = [];
    if (featured === "1") {
      conditions.push(eq(products.isFeatured, true));
    }
    if (category) {
      conditions.push(eq(products.category, category));
    }

    let allProducts;
    if (conditions.length > 0) {
      // 使用 and() 组合多个条件
      allProducts = await db.select().from(products).where(
        conditions.length === 1 ? conditions[0] : and(...conditions)
      );
    } else {
      allProducts = await db.select().from(products);
    }

    return NextResponse.json({ data: allProducts, error: null });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch products" }, { status: 500 });
  }
}
