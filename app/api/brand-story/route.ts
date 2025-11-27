import { NextResponse } from "next/server";
import { db } from "@/db";
import { brandStory } from "@/db/schema";

export async function GET() {
  try {
    const story = await db.select().from(brandStory).limit(1);
    if (story.length === 0) {
      // Create default if empty
      const defaultStory = await db
        .insert(brandStory)
        .values({
          heroTitle: "In-nutri · 有态度的超级食物",
          heroSubtitle: "源自真实原料",
          mission: "",
          vision: "",
          brandTone: "",
          storyBlocks: "[]",
        })
        .returning();
      return NextResponse.json({ data: defaultStory[0], error: null });
    }
    return NextResponse.json({ data: story[0], error: null });
  } catch (error) {
    console.error("Error fetching brand story:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch brand story" }, { status: 500 });
  }
}

