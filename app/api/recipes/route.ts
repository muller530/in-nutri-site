import { NextResponse } from "next/server";

import { db } from "@/db";

import { recipes } from "@/db/schema";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export async function GET() {
  try {
    const allRecipes = await db.select().from(recipes);
    return NextResponse.json({ data: allRecipes, error: null });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch recipes" }, { status: 500 });
  }
}



