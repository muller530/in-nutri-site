import { db } from "../db/index";
import { navigationItems } from "../db/schema";

async function seedNavigation() {
  try {
    // 检查是否已有导航项
    const existing = await db.select().from(navigationItems).limit(1);
    if (existing.length > 0) {
      console.log("导航项已存在，跳过种子数据。");
      console.log("如需重置，请先删除现有导航项或使用 --force 参数（如果支持）。");
      return;
    }

    // 创建默认导航项（根据截图预设）
    // 左侧导航：产品相关
    // 右侧导航：服务和联系
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
    console.log("\n💡 提示：您可以在后台管理页面 /admin/navigation 修改这些导航项");
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

