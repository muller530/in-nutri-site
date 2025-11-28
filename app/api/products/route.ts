import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { products } from "@/db/schema";

import { eq } from "drizzle-orm";

// 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");

    let allProducts;
    if (featured === "1") {
      allProducts = await db.select().from(products).where(eq(products.isFeatured, true));
    } else {
      allProducts = await db.select().from(products);
    }

    return NextResponse.json({ data: allProducts, error: null });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch products" }, { status: 500 });
  }
}
