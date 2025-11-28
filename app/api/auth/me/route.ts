import { NextRequest, NextResponse } from "next/server";

import { parseAdminFromRequest } from "@/lib/auth";

// 使用 Node.js runtime，因为 parseAdminFromRequest 需要数据库连接
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  const user = await parseAdminFromRequest(request);
  return NextResponse.json({ user });
}

