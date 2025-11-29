import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { members } from "@/db/schema";

import { eq } from "drizzle-orm";

import bcrypt from "bcryptjs";

import { createSession, getSessionCookieName } from "@/lib/auth";

import { cookies } from "next/headers";

import { z } from "zod";

// 使用 Node.js runtime，因为 bcryptjs 在 Edge Runtime 中可能无法正常工作
export const runtime = 'nodejs';
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // 尝试查询数据库
    let member;
    try {
      member = await db.select().from(members).where(eq(members.email, email)).limit(1);
    } catch (dbError: any) {
      console.error("数据库查询错误:", dbError);
      
      // 检查是否是 EdgeOne 环境
      const isEdgeOne = process.env.EDGEONE_DEPLOY === "true" || !!process.env.EDGEONE_URL;
      
      // 检查错误消息是否包含 EdgeOne 相关提示
      const errorMessage = dbError?.message || String(dbError);
      const isEdgeOneError = errorMessage.includes("EdgeOne") || errorMessage.includes("云数据库");
      
      if (isEdgeOne || isEdgeOneError) {
        console.error("⚠️ EdgeOne 环境：数据库连接失败");
        console.error("💡 解决方案：");
        console.error("   1. 使用腾讯云 MySQL/PostgreSQL 数据库");
        console.error("   2. 在 EdgeOne 环境变量中设置 DATABASE_URL（MySQL/PostgreSQL 连接字符串）");
        console.error("   3. 或使用腾讯云轻量应用服务器部署（支持 SQLite）");
        return NextResponse.json({ 
          success: false, 
          error: "数据库连接失败：EdgeOne 环境不支持 SQLite，请配置云数据库（MySQL/PostgreSQL）或使用腾讯云服务器部署" 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: "数据库连接失败，请检查数据库配置" 
      }, { status: 500 });
    }

    if (member.length === 0) {
      console.warn(`登录失败: 用户不存在 - ${email}`);
      return NextResponse.json({ success: false, error: "邮箱或密码错误" }, { status: 401 });
    }

    if (!member[0].isActive) {
      console.warn(`登录失败: 用户未激活 - ${email}`);
      return NextResponse.json({ success: false, error: "账户已被禁用" }, { status: 401 });
    }

    // 验证密码
    let isValid;
    try {
      isValid = await bcrypt.compare(password, member[0].passwordHash);
    } catch (bcryptError: any) {
      console.error("密码验证错误:", bcryptError);
      return NextResponse.json({ success: false, error: "密码验证失败" }, { status: 500 });
    }

    if (!isValid) {
      console.warn(`登录失败: 密码错误 - ${email}`);
      return NextResponse.json({ success: false, error: "邮箱或密码错误" }, { status: 401 });
    }

    // 创建会话
    let sessionToken;
    try {
      sessionToken = await createSession(member[0].id);
    } catch (sessionError: any) {
      console.error("创建会话错误:", sessionError);
      return NextResponse.json({ success: false, error: "创建会话失败" }, { status: 500 });
    }

    // 设置 Cookie
    try {
      const cookieStore = await cookies();
      
      // 检查是否是 HTTPS（通过环境变量或请求头）
      // EdgeOne 通常使用 HTTPS，但可能没有正确设置 x-forwarded-proto
      const isSecure = process.env.NODE_ENV === "production" && 
                      (process.env.FORCE_SECURE_COOKIE === "true" || 
                       request.headers.get("x-forwarded-proto") === "https" ||
                       request.url.startsWith("https://"));
      
      cookieStore.set(getSessionCookieName(), sessionToken, {
        httpOnly: true,
        secure: isSecure, // 根据实际环境设置
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      console.log(`登录成功: ${email}, secure=${isSecure}`);
    } catch (cookieError: any) {
      console.error("设置 Cookie 错误:", cookieError);
      // 即使 Cookie 设置失败，也返回成功（某些环境下可能正常）
      // 但记录错误以便排查
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: "输入格式错误: " + error.issues.map(e => e.message).join(", ") 
      }, { status: 400 });
    }
    console.error("登录过程发生错误:", error);
    return NextResponse.json({ 
      success: false, 
      error: "登录失败: " + (error instanceof Error ? error.message : "未知错误") 
    }, { status: 500 });
  }
}

