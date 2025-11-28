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

    const member = await db.select().from(members).where(eq(members.email, email)).limit(1);
    if (member.length === 0 || !member[0].isActive) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, member[0].passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const sessionToken = await createSession(member[0].id);
    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("Error during login:", error);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}

