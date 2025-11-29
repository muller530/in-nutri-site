import { NextResponse } from "next/server";

import { cookies } from "next/headers";

import { getSessionCookieName } from "@/lib/auth";

// 使用 Node.js runtime，因为需要使用 cookies API
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName());
  return NextResponse.json({ success: true });
}

