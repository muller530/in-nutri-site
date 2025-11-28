import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { articles } from "@/db/schema";

import { requireAdmin } from "@/lib/auth";

import { z } from "zod";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
const createArticleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
  publishedAt: z.number().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const allArticles = await db.select().from(articles);
    return NextResponse.json({ data: allArticles, error: null });
  } catch (error) {
    return error as Response;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validated = createArticleSchema.parse(body);

    const newArticle = await db
      .insert(articles)
      .values({
        slug: validated.slug,
        title: validated.title,
        summary: validated.summary || null,
        content: validated.content || null,
        coverImage: validated.coverImage || null,
        published: validated.published,
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : null,
      })
      .returning();

    return NextResponse.json({ data: newArticle[0], error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error creating article:", error);
    return NextResponse.json({ data: null, error: "Failed to create article" }, { status: 500 });
  }
}

