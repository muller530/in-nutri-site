import { NextResponse } from "next/server";

import { db } from "@/db";

import { galleryImages } from "@/db/schema";

import { asc } from "drizzle-orm";

export const runtime = 'edge';
export async function GET() {
  try {
    const allImages = await db.select().from(galleryImages).orderBy(asc(galleryImages.sortOrder));
    return NextResponse.json({ data: allImages, error: null });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch gallery images" }, { status: 500 });
  }
}

