import { NextResponse } from "next/server";
import { db } from "@/db";
import { recipes } from "@/db/schema";

export async function GET() {
  try {
    const allRecipes = await db.select().from(recipes);
    return NextResponse.json({ data: allRecipes, error: null });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch recipes" }, { status: 500 });
  }
}

