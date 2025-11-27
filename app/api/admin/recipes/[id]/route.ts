import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { recipes } from "@/db/schema";

import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth";

import { z } from "zod";

export const runtime = 'edge';
const updateRecipeSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  ingredients: z.array(z.any()).optional(),
  steps: z.array(z.string()).optional(),
  heroImage: z.string().optional(),
  relatedProductSlugs: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const recipe = await db.select().from(recipes).where(eq(recipes.id, parseInt(id, 10))).limit(1);

    if (recipe.length === 0) {
      return NextResponse.json({ data: null, error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ data: recipe[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching recipe:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch recipe" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updateRecipeSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.ingredients !== undefined) updateData.ingredients = JSON.stringify(validated.ingredients);
    if (validated.steps !== undefined) updateData.steps = JSON.stringify(validated.steps);
    if (validated.heroImage !== undefined) updateData.heroImage = validated.heroImage;
    if (validated.relatedProductSlugs !== undefined) updateData.relatedProductSlugs = JSON.stringify(validated.relatedProductSlugs);
    if (validated.difficulty !== undefined) updateData.difficulty = validated.difficulty;

    const result = await db
      .update(recipes)
      .set(updateData)
      .where(eq(recipes.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result[0], error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error updating recipe:", error);
    return NextResponse.json({ data: null, error: "Failed to update recipe" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const result = await db.delete(recipes).where(eq(recipes.id, parseInt(id, 10))).returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting recipe:", error);
    return NextResponse.json({ data: null, error: "Failed to delete recipe" }, { status: 500 });
  }
}

