import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const createRecipeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  ingredients: z.array(z.any()).optional(),
  steps: z.array(z.string()).optional(),
  heroImage: z.string().optional(),
  relatedProductSlugs: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const allRecipes = await db.select().from(recipes);
    return NextResponse.json({ data: allRecipes, error: null });
  } catch (error) {
    return error as Response;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validated = createRecipeSchema.parse(body);

    const newRecipe = await db
      .insert(recipes)
      .values({
        slug: validated.slug,
        name: validated.name,
        description: validated.description || null,
        ingredients: validated.ingredients ? JSON.stringify(validated.ingredients) : null,
        steps: validated.steps ? JSON.stringify(validated.steps) : null,
        heroImage: validated.heroImage || null,
        relatedProductSlugs: validated.relatedProductSlugs ? JSON.stringify(validated.relatedProductSlugs) : null,
        difficulty: validated.difficulty || null,
      })
      .returning();

    return NextResponse.json({ data: newRecipe[0], error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error creating recipe:", error);
    return NextResponse.json({ data: null, error: "Failed to create recipe" }, { status: 500 });
  }
}

