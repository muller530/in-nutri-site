import { db } from "../db/index";
import { members } from "../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function resetAdminPassword() {
  try {
    const email = "admin@in-nutri.com";
    const newPassword = "inNutriAdmin123";
    
    // 查找管理员账号
    const adminUsers = await db.select().from(members).where(eq(members.email, email)).limit(1);
    
    if (adminUsers.length === 0) {
      console.log("❌ 未找到管理员账号，正在创建...");
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await db.insert(members).values({
        email: email,
        name: "Admin",
        passwordHash,
        role: "admin",
        isActive: true,
      });
      console.log("✅ 管理员账号已创建");
    } else {
      console.log("✅ 找到管理员账号，正在重置密码...");
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await db.update(members)
        .set({ 
          passwordHash,
          isActive: true 
        })
        .where(eq(members.email, email));
      console.log("✅ 密码已重置");
    }
    
    console.log("\n📋 管理员账号信息：");
    console.log(`   邮箱: ${email}`);
    console.log(`   密码: ${newPassword}`);
    console.log("\n✅ 密码重置完成！");
    process.exit(0);
  } catch (error) {
    console.error("❌ 重置密码失败:", error);
    process.exit(1);
  }
}

resetAdminPassword();




