import { NextResponse } from "next/server";

import { db } from "@/db";

import { brandStory } from "@/db/schema";

export const runtime = 'edge';
export async function GET() {
  try {
    const story = await db.select().from(brandStory).limit(1);
    if (story.length === 0) {
      // 返回默认数据，不尝试插入（避免数据库错误）
      const defaultStory = {
        id: 1,
        heroTitle: "In-nutri · 有态度的超级食物",
        heroSubtitle: "源自真实原料",
        mission: "我们用看得见的原料，而不是听起来很厉害的噱头。让自然成分在城市生活中重新被看见。",
        vision: "",
        brandTone: "",
        storyBlocks: "[]",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json({ data: defaultStory, error: null });
    }
    return NextResponse.json({ data: story[0], error: null });
  } catch (error) {
    console.error("Error fetching brand story:", error);
    // 即使出错，也返回默认数据，确保页面能正常显示
    const defaultStory = {
      id: 1,
      heroTitle: "In-nutri · 有态度的超级食物",
      heroSubtitle: "源自真实原料",
      mission: "我们用看得见的原料，而不是听起来很厉害的噱头。让自然成分在城市生活中重新被看见。",
      vision: "",
      brandTone: "",
      storyBlocks: "[]",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ data: defaultStory, error: null });
  }
}

