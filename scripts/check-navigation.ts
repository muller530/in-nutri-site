import { db } from "../db/index";
import { navigationItems } from "../db/schema";

async function checkNavigation() {
  try {
    const items = await db.select().from(navigationItems);
    
    console.log(`\n📋 当前导航项 (共 ${items.length} 项):\n`);
    items.forEach((item) => {
      console.log(`ID: ${item.id}`);
      console.log(`  标签: ${item.label}`);
      console.log(`  位置: ${item.position}`);
      console.log(`  父ID: ${item.parentId || '无'}`);
      console.log(`  激活: ${item.isActive}`);
      console.log(`  排序: ${item.sortOrder}`);
      console.log('');
    });
    
    // 查找没有父ID的项（父菜单）
    const parentItems = items.filter(item => !item.parentId);
    console.log(`\n📌 父菜单项 (${parentItems.length} 项):`);
    parentItems.forEach(item => {
      console.log(`  - ${item.label} (ID: ${item.id})`);
    });
    
    // 查找有父ID的项（子菜单）
    const childItems = items.filter(item => item.parentId);
    console.log(`\n📌 子菜单项 (${childItems.length} 项):`);
    childItems.forEach(item => {
      console.log(`  - ${item.label} (父ID: ${item.parentId})`);
    });
    
  } catch (error) {
    console.error("检查导航项失败:", error);
    throw error;
  }
}

checkNavigation()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 检查失败:", error);
    process.exit(1);
  });

