import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { banners } from "@/db/schema";

import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth";

import { z } from "zod";

export const runtime = 'edge';
const updateBannerSchema = z.object({
  key: z.string().min(1).optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  linkUrl: z.string().optional(),
  position: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const banner = await db.select().from(banners).where(eq(banners.id, parseInt(id, 10))).limit(1);

    if (banner.length === 0) {
      return NextResponse.json({ data: null, error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ data: banner[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching banner:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch banner" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updateBannerSchema.parse(body);

    const result = await db
      .update(banners)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error updating banner:", error);
    return NextResponse.json({ data: null, error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const result = await db.delete(banners).where(eq(banners.id, parseInt(id, 10))).returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting banner:", error);
    return NextResponse.json({ data: null, error: "Failed to delete banner" }, { status: 500 });
  }
}

