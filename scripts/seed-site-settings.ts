import { db } from "../db/index";
import { siteSettings } from "../db/schema";

async function seedSiteSettings() {
  try {
    // 检查是否已有站点设置
    const existing = await db.select().from(siteSettings).limit(1);
    if (existing.length > 0) {
      console.log("站点设置已存在，跳过种子数据。");
      return;
    }

    // 创建默认站点设置
    await db.insert(siteSettings).values({
      douyinUrl: null,
      xiaohongshuUrl: null,
      tmallUrl: null,
      jdUrl: null,
      qualityReportUrl: null,
      promotionalBannerText: "30% OFF EVERYTHING // NO CODES NEEDED",
      promotionalBannerUrl: null,
      promotionalBannerActive: false, // 默认不启用，用户可以在后台启用
      logoTagline: "NATURE-POWERED",
    });

    console.log("✅ 默认站点设置已创建:");
    console.log("   促销横幅文字: 30% OFF EVERYTHING // NO CODES NEEDED");
    console.log("   促销横幅状态: 未启用（可在后台启用）");
    console.log("   Logo 标语: NATURE-POWERED");
  } catch (error) {
    console.error("创建站点设置失败:", error);
    throw error;
  }
}

seedSiteSettings()
  .then(() => {
    console.log("✅ 站点设置种子数据导入完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 站点设置种子数据导入失败:", error);
    process.exit(1);
  });

