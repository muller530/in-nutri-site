import { NextRequest, NextResponse } from "next/server";

import { parseAdminFromRequest } from "@/lib/auth";

export const runtime = 'edge';
export async function GET(request: NextRequest) {
  const user = await parseAdminFromRequest(request);
  return NextResponse.json({ user });
}

