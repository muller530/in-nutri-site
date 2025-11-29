import { db } from "../db";
import { socialPlatforms } from "../db/schema";
import { eq } from "drizzle-orm";

async function testSocialPlatforms() {
  try {
    console.log("测试社交媒体平台数据库...");

    // 1. 测试查询
    console.log("\n1. 测试查询所有平台...");
    const allPlatforms = await db.select().from(socialPlatforms);
    console.log(`✓ 查询成功，找到 ${allPlatforms.length} 个平台`);

    // 2. 测试插入
    console.log("\n2. 测试插入新平台...");
    const testPlatform = {
      name: "Test Platform",
      iconType: "svg" as const,
      iconSvg: '<svg width="24" height="24"><circle cx="12" cy="12" r="10"/></svg>',
      url: "https://example.com",
      sortOrder: 999,
      isActive: true,
    };

    const result = await db.insert(socialPlatforms).values(testPlatform).returning();
    console.log("✓ 插入成功:", result[0]);

    // 3. 测试删除
    console.log("\n3. 测试删除测试平台...");
    await db.delete(socialPlatforms).where(eq(socialPlatforms.id, result[0].id));
    console.log("✓ 删除成功");

    console.log("\n✅ 所有测试通过！");
  } catch (error) {
    console.error("\n❌ 测试失败:", error);
    if (error instanceof Error) {
      console.error("错误信息:", error.message);
      console.error("错误堆栈:", error.stack);
    }
    process.exit(1);
  }
}

testSocialPlatforms()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

