import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { galleryImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const updateGalleryImageSchema = z.object({
  title: z.string().optional(),
  alt: z.string().optional(),
  url: z.string().min(1).optional(),
  category: z.string().optional(),
  sortOrder: z.number().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const image = await db.select().from(galleryImages).where(eq(galleryImages.id, parseInt(id, 10))).limit(1);

    if (image.length === 0) {
      return NextResponse.json({ data: null, error: "Gallery image not found" }, { status: 404 });
    }

    return NextResponse.json({ data: image[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching gallery image:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch gallery image" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updateGalleryImageSchema.parse(body);

    const result = await db
      .update(galleryImages)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(galleryImages.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Gallery image not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error updating gallery image:", error);
    return NextResponse.json({ data: null, error: "Failed to update gallery image" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const result = await db.delete(galleryImages).where(eq(galleryImages.id, parseInt(id, 10))).returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Gallery image not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting gallery image:", error);
    return NextResponse.json({ data: null, error: "Failed to delete gallery image" }, { status: 500 });
  }
}

