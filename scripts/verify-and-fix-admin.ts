import { db } from "../db/index";
import { members } from "../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function verifyAndFixAdmin() {
  try {
    const email = "admin@in-nutri.com";
    const password = "inNutriAdmin123";
    
    console.log("🔍 开始验证管理员账号...\n");
    
    // 1. 检查数据库连接
    console.log("1. 检查数据库连接...");
    try {
      const testResult = await db.select().from(members).limit(1);
      console.log("✅ 数据库连接正常\n");
    } catch (error: any) {
      console.error("❌ 数据库连接失败:", error.message);
      console.error("\n💡 请先运行: npm run db:push");
      process.exit(1);
    }
    
    // 2. 查找管理员账号
    console.log("2. 查找管理员账号...");
    const adminUsers = await db.select().from(members).where(eq(members.email, email)).limit(1);
    
    if (adminUsers.length === 0) {
      console.log("❌ 未找到管理员账号");
      console.log("🔧 正在创建管理员账号...\n");
      
      const passwordHash = await bcrypt.hash(password, 10);
      await db.insert(members).values({
        email: email,
        name: "Admin",
        passwordHash,
        role: "admin",
        isActive: true,
      });
      
      console.log("✅ 管理员账号已创建\n");
    } else {
      const admin = adminUsers[0];
      console.log("✅ 找到管理员账号");
      console.log(`   邮箱: ${admin.email}`);
      console.log(`   名称: ${admin.name}`);
      console.log(`   角色: ${admin.role}`);
      console.log(`   状态: ${admin.isActive ? "激活" : "未激活"}\n`);
      
      // 3. 验证密码
      console.log("3. 验证密码...");
      const isValid = await bcrypt.compare(password, admin.passwordHash);
      
      if (!isValid) {
        console.log("❌ 密码不匹配");
        console.log("🔧 正在重置密码...\n");
        
        const passwordHash = await bcrypt.hash(password, 10);
        await db.update(members)
          .set({ 
            passwordHash,
            isActive: true 
          })
          .where(eq(members.email, email));
        
        console.log("✅ 密码已重置\n");
      } else {
        console.log("✅ 密码正确\n");
      }
      
      // 4. 确保账号是激活状态
      if (!admin.isActive) {
        console.log("4. 账号未激活");
        console.log("🔧 正在激活账号...\n");
        
        await db.update(members)
          .set({ isActive: true })
          .where(eq(members.email, email));
        
        console.log("✅ 账号已激活\n");
      }
    }
    
    // 5. 最终验证
    console.log("5. 最终验证...");
    const finalCheck = await db.select().from(members).where(eq(members.email, email)).limit(1);
    
    if (finalCheck.length === 0) {
      console.error("❌ 验证失败：管理员账号不存在");
      process.exit(1);
    }
    
    const finalAdmin = finalCheck[0];
    const finalPasswordCheck = await bcrypt.compare(password, finalAdmin.passwordHash);
    
    if (!finalPasswordCheck) {
      console.error("❌ 验证失败：密码不正确");
      process.exit(1);
    }
    
    if (!finalAdmin.isActive) {
      console.error("❌ 验证失败：账号未激活");
      process.exit(1);
    }
    
    console.log("✅ 所有验证通过！\n");
    
    // 6. 显示账号信息
    console.log("═══════════════════════════════════════");
    console.log("📋 管理员账号信息");
    console.log("═══════════════════════════════════════");
    console.log(`邮箱: ${email}`);
    console.log(`密码: ${password}`);
    console.log(`状态: 激活`);
    console.log(`角色: 管理员`);
    console.log("═══════════════════════════════════════\n");
    
    console.log("✅ 管理员账号验证和修复完成！");
    console.log("\n💡 现在可以使用以下账号登录：");
    console.log(`   邮箱: ${email}`);
    console.log(`   密码: ${password}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ 验证和修复失败:", error);
    console.error("\n错误详情:", error.message);
    console.error("\n堆栈:", error.stack);
    process.exit(1);
  }
}

verifyAndFixAdmin();




