import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const createBannerSchema = z.object({
  key: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  linkUrl: z.string().optional(),
  position: z.number().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const allBanners = await db.select().from(banners);
    return NextResponse.json({ data: allBanners, error: null });
  } catch (error) {
    return error as Response;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validated = createBannerSchema.parse(body);

    const newBanner = await db.insert(banners).values(validated).returning();

    return NextResponse.json({ data: newBanner[0], error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error creating banner:", error);
    return NextResponse.json({ data: null, error: "Failed to create banner" }, { status: 500 });
  }
}

