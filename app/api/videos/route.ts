import { NextResponse } from "next/server";

import { db } from "@/db";

import { videos, products } from "@/db/schema";

import { eq } from "drizzle-orm";

export const runtime = 'edge';
export async function GET() {
  try {
    const allVideos = await db.select().from(videos).where(eq(videos.isActive, true));
    
    // 优先使用上传的视频（URL以 /uploads/videos/ 开头）
    const sortedVideos = allVideos.sort((a: any, b: any) => {
      const aIsUploaded = a.url?.startsWith("/uploads/videos/") ? 1 : 0;
      const bIsUploaded = b.url?.startsWith("/uploads/videos/") ? 1 : 0;
      return bIsUploaded - aIsUploaded; // 上传的视频排在前面
    });
    
    // 获取关联的产品信息
    const videosWithProducts = await Promise.all(
      sortedVideos.map(async (video: any) => {
        if (video.productId) {
          const product = await db
            .select()
            .from(products)
            .where(eq(products.id, video.productId))
            .limit(1);
          return {
            ...video,
            product: product[0] || null,
          };
        }
        return { ...video, product: null };
      })
    );
    
    return NextResponse.json({ data: videosWithProducts, error: null });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch videos" }, { status: 500 });
  }
}

