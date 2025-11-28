import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { articles } from "@/db/schema";

import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth";

import { z } from "zod";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
const updateArticleSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().optional(),
  publishedAt: z.number().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const article = await db.select().from(articles).where(eq(articles.id, parseInt(id, 10))).limit(1);

    if (article.length === 0) {
      return NextResponse.json({ data: null, error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ data: article[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching article:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updateArticleSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.summary !== undefined) updateData.summary = validated.summary;
    if (validated.content !== undefined) updateData.content = validated.content;
    if (validated.coverImage !== undefined) updateData.coverImage = validated.coverImage;
    if (validated.published !== undefined) updateData.published = validated.published;
    if (validated.publishedAt !== undefined) {
      updateData.publishedAt = validated.publishedAt ? new Date(validated.publishedAt) : null;
    }

    const result = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error updating article:", error);
    return NextResponse.json({ data: null, error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const result = await db.delete(articles).where(eq(articles.id, parseInt(id, 10))).returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting article:", error);
    return NextResponse.json({ data: null, error: "Failed to delete article" }, { status: 500 });
  }
}

