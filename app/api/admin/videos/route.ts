import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { videos } from "@/db/schema";

import { requireAdmin } from "@/lib/auth";

import { z } from "zod";

export const runtime = 'edge';
const createVideoSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  type: z.string().optional(),
  platform: z.string().optional(),
  url: z.string().min(1, "请上传视频文件或填写视频URL"),
  coverImage: z.string().optional(),
  durationSec: z.number().optional(),
  productId: z.number().int().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const allVideos = await db.select().from(videos);
    return NextResponse.json({ data: allVideos, error: null });
  } catch (error) {
    return error as Response;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validated = createVideoSchema.parse(body);

    const newVideo = await db.insert(videos).values(validated).returning();

    return NextResponse.json({ data: newVideo[0], error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error creating video:", error);
    return NextResponse.json({ data: null, error: "Failed to create video" }, { status: 500 });
  }
}

