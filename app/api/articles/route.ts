import { NextResponse } from "next/server";

import { db } from "@/db";

import { articles } from "@/db/schema";

import { eq } from "drizzle-orm";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export async function GET() {
  try {
    const allArticles = await db.select().from(articles).where(eq(articles.published, true));
    return NextResponse.json({ data: allArticles, error: null });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch articles" }, { status: 500 });
  }
}
