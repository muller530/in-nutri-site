import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { recipes } from "@/db/schema";

import { eq } from "drizzle-orm";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const recipe = await db.select().from(recipes).where(eq(recipes.slug, slug)).limit(1);

    if (recipe.length === 0) {
      return NextResponse.json({ data: null, error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ data: recipe[0], error: null });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch recipe" }, { status: 500 });
  }
}






