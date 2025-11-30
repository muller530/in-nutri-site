import { NextResponse } from "next/server";
import { db } from "@/db";
import { navigationItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const items = await db
      .select()
      .from(navigationItems)
      .where(eq(navigationItems.isActive, true))
      .orderBy(asc(navigationItems.sortOrder));

    return NextResponse.json({ data: items, error: null });
  } catch (error) {
    console.error("Error fetching navigation items:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch navigation items" },
      { status: 500 }
    );
  }
}




