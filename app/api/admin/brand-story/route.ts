import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brandStory } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const updateBrandStorySchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  brandTone: z.string().optional(),
  storyBlocks: z.array(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    let story = await db.select().from(brandStory).limit(1);

    if (story.length === 0) {
      // Create default if none exists
      const defaultStory = {
        heroTitle: "In-nutri · 有态度的超级食物",
        heroSubtitle: "源自真实原料，为真实生活补能",
        mission: "我们只做一件事：把\"超级食物\"还原成看得见的好原料。",
        vision: "成为亚洲领先的功能营养品牌，以科学和自然的力量赋能健康生活。",
        brandTone: "真实、克制、科学、自然",
        storyBlocks: JSON.stringify([
          { title: "原产地严选", body: "印尼可可、锡兰肉桂、秘鲁姜黄、巴西莓等全球优质原料。" },
        ]),
      };
      const newStory = await db.insert(brandStory).values(defaultStory).returning();
      story = newStory;
    }

    return NextResponse.json({ data: story[0], error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching brand story:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch brand story" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validated = updateBrandStorySchema.parse(body);

    // Get existing story or create one
    const existingStory = await db.select().from(brandStory).limit(1);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.heroTitle !== undefined) updateData.heroTitle = validated.heroTitle;
    if (validated.heroSubtitle !== undefined) updateData.heroSubtitle = validated.heroSubtitle;
    if (validated.mission !== undefined) updateData.mission = validated.mission;
    if (validated.vision !== undefined) updateData.vision = validated.vision;
    if (validated.brandTone !== undefined) updateData.brandTone = validated.brandTone;
    if (validated.storyBlocks !== undefined) updateData.storyBlocks = JSON.stringify(validated.storyBlocks);

    if (existingStory.length === 0) {
      // Create new if doesn't exist
      const result = await db.insert(brandStory).values(updateData).returning();
      return NextResponse.json({ data: result[0], error: null });
    } else {
      // Update existing
      const result = await db.update(brandStory).set(updateData).returning();
      return NextResponse.json({ data: result[0], error: null });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error updating brand story:", error);
    return NextResponse.json({ data: null, error: "Failed to update brand story" }, { status: 500 });
  }
}

