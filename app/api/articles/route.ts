import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allArticles = await db.select().from(articles).where(eq(articles.published, true));
    return NextResponse.json({ data: allArticles, error: null });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch articles" }, { status: 500 });
  }
}
