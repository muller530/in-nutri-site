import { NextRequest, NextResponse } from "next/server";
import { parseAdminFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await parseAdminFromRequest(request);
  return NextResponse.json({ user });
}

