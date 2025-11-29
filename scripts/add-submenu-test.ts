import { db } from "../db/index";
import { navigationItems } from "../db/schema";
import { eq } from "drizzle-orm";

async function addSubmenuTest() {
  try {
    // 查找 "Shop All" 导航项作为父菜单
    const shopAllItems = await db
      .select()
      .from(navigationItems)
      .where(eq(navigationItems.label, "Shop All"))
      .limit(1);

    if (shopAllItems.length === 0) {
      console.log("❌ 未找到 'Shop All' 导航项，请先运行 npm run db:seed-navigation");
      process.exit(1);
    }

    const parentId = shopAllItems[0].id;
    console.log(`找到父菜单项 "Shop All"，ID: ${parentId}`);

    // 检查是否已有子菜单
    const existingChildren = await db
      .select()
      .from(navigationItems)
      .where(eq(navigationItems.parentId, parentId))
      .limit(1);

    if (existingChildren.length > 0) {
      console.log("✅ 子菜单已存在，跳过创建。");
      console.log("如需重新创建，请先删除现有子菜单项。");
      return;
    }

    // 创建子菜单项
    const submenuItems = [
      {
        label: "所有产品",
        url: "/products",
        type: "link",
        position: "left",
        sortOrder: 1,
        parentId: parentId,
        isActive: true,
        openInNewTab: false,
      },
      {
        label: "推荐产品",
        url: "/products?featured=1",
        type: "link",
        position: "left",
        sortOrder: 2,
        parentId: parentId,
        isActive: true,
        openInNewTab: false,
      },
      {
        label: "新品上市",
        url: "/products?new=1",
        type: "link",
        position: "left",
        sortOrder: 3,
        parentId: parentId,
        isActive: true,
        openInNewTab: false,
      },
    ];

    await db.insert(navigationItems).values(submenuItems);

    console.log("✅ 子菜单项已创建:");
    submenuItems.forEach((item) => {
      console.log(`   - ${item.label}`);
    });
    console.log("\n💡 提示：现在 'Shop All' 菜单应该有下拉子菜单了");
  } catch (error) {
    console.error("创建子菜单失败:", error);
    throw error;
  }
}

addSubmenuTest()
  .then(() => {
    console.log("✅ 子菜单测试数据添加完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 子菜单测试数据添加失败:", error);
    process.exit(1);
  });

