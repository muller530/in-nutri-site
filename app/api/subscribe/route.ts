import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { subscribers, type NewSubscriber } from "@/db/schema";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const newSubscriber: NewSubscriber = {
        email: normalizedEmail,
      };

      const result = await db.insert(subscribers).values(newSubscriber).returning();
      return NextResponse.json({ message: "Successfully subscribed", id: result[0].id }, { status: 201 });
    } catch (error) {
      // 处理唯一约束冲突（邮箱已存在）
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("UNIQUE constraint")) {
        return NextResponse.json({ message: "Email already subscribed" }, { status: 200 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error subscribing:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

