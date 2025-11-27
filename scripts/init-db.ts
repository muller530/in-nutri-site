import { execSync } from "child_process";
import { seedAdmin } from "../db/seedAdmin";
import { seedData } from "../db/seedData";

async function initDb() {
  try {
    console.log("运行 Drizzle 迁移...");
    execSync("npm run db:push", { stdio: "inherit" });
    console.log("迁移完成。\n");

    console.log("导入管理员账户...");
    await seedAdmin();
    console.log("管理员账户导入完成。\n");

    console.log("导入前台数据...");
    await seedData();
    console.log("前台数据导入完成。\n");

    console.log("✅ 数据库初始化成功！");
    process.exit(0);
  } catch (error) {
    console.error("数据库初始化失败:", error);
    process.exit(1);
  }
}

initDb();

