import { NextResponse } from "next/server";

import { db } from "@/db";

import { banners } from "@/db/schema";

import { eq, asc } from "drizzle-orm";

// 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export const runtime = 'nodejs';
export async function GET() {
  try {
    const allBanners = await db
      .select()
      .from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.position));
    // 如果数据库返回空数组，返回默认数据
    if (allBanners.length === 0) {
      return NextResponse.json({ 
        data: [{
          key: "home-hero",
          title: "In-nutri · 有态度的超级食物",
          subtitle: "源自真实原料",
          description: "我们用看得见的原料，而不是听起来很厉害的噱头。让自然成分在城市生活中重新被看见。",
          image: "",
          linkUrl: "#products",
          position: 0,
          isActive: true,
        }], 
        error: null 
      });
    }
    return NextResponse.json({ data: allBanners, error: null });
  } catch (error) {
    console.error("Error fetching banners:", error);
    // 即使出错，也返回默认数据，确保页面能正常显示
    return NextResponse.json({ 
      data: [{
        key: "home-hero",
        title: "In-nutri · 有态度的超级食物",
        subtitle: "源自真实原料",
        description: "我们用看得见的原料，而不是听起来很厉害的噱头。让自然成分在城市生活中重新被看见。",
        image: "",
        linkUrl: "#products",
        position: 0,
        isActive: true,
      }], 
      error: null 
    });
  }
}

