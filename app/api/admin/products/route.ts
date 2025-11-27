import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { products } from "@/db/schema";

import { requireAdmin } from "@/lib/auth";

import { z } from "zod";

export const runtime = 'edge';
const createProductSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  priceCents: z.number().int().default(0),
  mainImage: z.string().optional(),
  gallery: z.string().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  category: z.string().optional(),
  purchaseUrl: z.string().url().optional(),
  viewCount: z.number().int().default(0).optional(),
  isFeatured: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const allProducts = await db.select().from(products);
    return NextResponse.json({ data: allProducts, error: null });
  } catch (error) {
    return error as Response;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validated = createProductSchema.parse(body);

    // 处理tags：确保是JSON字符串
    const tagsValue = validated.tags
      ? Array.isArray(validated.tags)
        ? JSON.stringify(validated.tags)
        : validated.tags
      : "[]";

    const newProduct = await db
      .insert(products)
      .values({
        slug: validated.slug,
        name: validated.name,
        shortDescription: validated.shortDescription || null,
        longDescription: validated.longDescription || null,
        priceCents: validated.priceCents,
        mainImage: validated.mainImage || null,
        gallery: validated.gallery || "[]",
        tags: tagsValue,
        category: validated.category || null,
        purchaseUrl: validated.purchaseUrl || null,
        viewCount: validated.viewCount || 0,
        isFeatured: validated.isFeatured,
      })
      .returning();

    return NextResponse.json({ data: newProduct[0], error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error creating product:", error);
    return NextResponse.json({ data: null, error: "Failed to create product" }, { status: 500 });
  }
}

