import { db } from "../db";
import { banners } from "../db/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function fixBannerVideo() {
  try {
    // 查找最新的视频文件
    const videosDir = path.join(process.cwd(), "public", "uploads", "videos");
    if (!fs.existsSync(videosDir)) {
      console.error("视频目录不存在:", videosDir);
      return;
    }

    const files = fs.readdirSync(videosDir)
      .filter(file => file.endsWith('.mp4') && !file.includes('video.mp4')) // 排除错误的 video.mp4 文件
      .map(file => ({
        name: file,
        path: path.join(videosDir, file),
        mtime: fs.statSync(path.join(videosDir, file)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (files.length === 0) {
      console.error("未找到视频文件");
      return;
    }

    const latestVideo = files[0];
    const videoUrl = `/uploads/videos/${latestVideo.name}`;
    
    console.log("找到最新视频文件:", latestVideo.name);
    console.log("视频 URL:", videoUrl);

    // 查找 home-hero 横幅
    const homeHeroBanners = await db
      .select()
      .from(banners)
      .where(eq(banners.key, "home-hero"))
      .limit(1);

    if (homeHeroBanners.length === 0) {
      console.error("未找到 home-hero 横幅");
      return;
    }

    const banner = homeHeroBanners[0];
    console.log("当前横幅 image 值:", banner.image);

    // 更新横幅的 image 字段
    const result = await db
      .update(banners)
      .set({
        image: videoUrl,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, banner.id))
      .returning();

    console.log("✅ 横幅已更新！");
    console.log("新的 image 值:", result[0].image);
  } catch (error) {
    console.error("修复失败:", error);
    process.exit(1);
  }
}

fixBannerVideo()
  .then(() => {
    console.log("修复完成！");
    process.exit(0);
  })
  .catch((error) => {
    console.error("错误:", error);
    process.exit(1);
  });

