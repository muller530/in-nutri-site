import { db } from "../db/index";
import { navigationItems } from "../db/schema";

async function seedNavigation() {
  try {
    // 检查是否已有导航项
    const existing = await db.select().from(navigationItems).limit(1);
    if (existing.length > 0) {
      console.log("导航项已存在，跳过种子数据。");
      return;
    }

    // 创建默认导航项（参考图片样式）
    const defaultItems = [
      // 左侧导航
      {
        label: "Shop All",
        url: "/#products",
        type: "link",
        position: "left",
        sortOrder: 1,
        isActive: true,
        openInNewTab: false,
      },
      {
        label: "Rewards",
        url: "/#rewards",
        type: "link",
        position: "left",
        sortOrder: 2,
        isActive: true,
        openInNewTab: false,
      },
      // 右侧导航
      {
        label: "Store Locator",
        url: "/#store",
        type: "link",
        position: "right",
        sortOrder: 1,
        isActive: true,
        openInNewTab: false,
      },
      {
        label: "Contact",
        url: "/#contact",
        type: "link",
        position: "right",
        sortOrder: 2,
        isActive: true,
        openInNewTab: false,
      },
    ];

    await db.insert(navigationItems).values(defaultItems);

    console.log("✅ 默认导航项已创建:");
    console.log("   左侧: Shop All, Rewards");
    console.log("   右侧: Store Locator, Contact");
  } catch (error) {
    console.error("创建导航项失败:", error);
    throw error;
  }
}

seedNavigation()
  .then(() => {
    console.log("✅ 导航项种子数据导入完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 导航项种子数据导入失败:", error);
    process.exit(1);
  });

