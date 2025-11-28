import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { articles } from "@/db/schema";

import { eq, and } from "drizzle-orm";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const article = await db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.published, true)))
      .limit(1);

    if (article.length === 0) {
      return NextResponse.json({ data: null, error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ data: article[0], error: null });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch article" }, { status: 500 });
  }
}

