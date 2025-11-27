import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const updateVideoSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  type: z.string().optional(),
  platform: z.string().optional(),
  url: z.string().min(1, "请上传视频文件或填写视频URL").optional(),
  coverImage: z.string().optional(),
  durationSec: z.number().optional(),
  productId: z.number().int().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const video = await db.select().from(videos).where(eq(videos.id, parseInt(id, 10))).limit(1);

    if (video.length === 0) {
      return NextResponse.json({ data: null, error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ data: video[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching video:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch video" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updateVideoSchema.parse(body);

    const result = await db
      .update(videos)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.errors }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error updating video:", error);
    return NextResponse.json({ data: null, error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const result = await db.delete(videos).where(eq(videos.id, parseInt(id, 10))).returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting video:", error);
    return NextResponse.json({ data: null, error: "Failed to delete video" }, { status: 500 });
  }
}

