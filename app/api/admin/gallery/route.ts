import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { galleryImages } from "@/db/schema";

import { requireAdmin } from "@/lib/auth";

import { z } from "zod";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
const createGalleryImageSchema = z.object({
  title: z.string().optional(),
  alt: z.string().optional(),
  url: z.string().min(1),
  category: z.string().optional(),
  sortOrder: z.number().default(0),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const allImages = await db.select().from(galleryImages);
    return NextResponse.json({ data: allImages, error: null });
  } catch (error) {
    return error as Response;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validated = createGalleryImageSchema.parse(body);

    const newImage = await db.insert(galleryImages).values(validated).returning();

    return NextResponse.json({ data: newImage[0], error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error creating gallery image:", error);
    return NextResponse.json({ data: null, error: "Failed to create gallery image" }, { status: 500 });
  }
}

