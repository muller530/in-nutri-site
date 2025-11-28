import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { products } from "@/db/schema";

import { eq } from "drizzle-orm";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await db.select().from(products).where(eq(products.slug, slug)).limit(1);

    if (product.length === 0) {
      return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product[0], error: null });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch product" }, { status: 500 });
  }
}

