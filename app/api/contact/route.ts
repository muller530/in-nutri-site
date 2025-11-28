import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

import { contactMessages, type NewContactMessage } from "@/db/schema";

import { desc } from "drizzle-orm";

export const runtime = 'nodejs'; // 使用 Node.js runtime，因为数据库连接在 Edge Runtime 中无法正常工作
export async function GET() {
  try {
    const allMessages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    return NextResponse.json(allMessages);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields: name, email, message" }, { status: 400 });
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const newMessage: NewContactMessage = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    };

    const result = await db.insert(contactMessages).values(newMessage).returning();
    return NextResponse.json({ message: "Contact message saved successfully", id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json({ error: "Failed to save contact message" }, { status: 500 });
  }
}
