import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const allBanners = await db
      .select()
      .from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.position));
    return NextResponse.json({ data: allBanners, error: null });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch banners" }, { status: 500 });
  }
}

