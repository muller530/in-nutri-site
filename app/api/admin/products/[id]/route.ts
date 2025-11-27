import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const updateProductSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  priceCents: z.number().int().optional(),
  mainImage: z.string().optional(),
  gallery: z.string().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  category: z.string().optional(),
  purchaseUrl: z.string().url().optional(),
  viewCount: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const product = await db.select().from(products).where(eq(products.id, parseInt(id, 10))).limit(1);

    if (product.length === 0) {
      return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching product:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updateProductSchema.parse(body);

    // 处理tags：确保是JSON字符串
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.shortDescription !== undefined) updateData.shortDescription = validated.shortDescription;
    if (validated.longDescription !== undefined) updateData.longDescription = validated.longDescription;
    if (validated.priceCents !== undefined) updateData.priceCents = validated.priceCents;
    if (validated.mainImage !== undefined) updateData.mainImage = validated.mainImage;
    if (validated.gallery !== undefined) updateData.gallery = validated.gallery;
    if (validated.tags !== undefined) {
      updateData.tags = Array.isArray(validated.tags)
        ? JSON.stringify(validated.tags)
        : validated.tags;
    }
    if (validated.category !== undefined) updateData.category = validated.category;
    if (validated.purchaseUrl !== undefined) updateData.purchaseUrl = validated.purchaseUrl;
    if (validated.viewCount !== undefined) updateData.viewCount = validated.viewCount;
    if (validated.isFeatured !== undefined) updateData.isFeatured = validated.isFeatured;

    const result = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error updating product:", error);
    return NextResponse.json({ data: null, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const result = await db.delete(products).where(eq(products.id, parseInt(id, 10))).returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting product:", error);
    return NextResponse.json({ data: null, error: "Failed to delete product" }, { status: 500 });
  }
}

