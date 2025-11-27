import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6),
  role: z.string().default("admin"),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    // Only admins can view members
    if (admin.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const allMembers = await db.select().from(members);
    // Don't return password hashes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const safeMembers = allMembers.map(({ passwordHash: _, ...member }) => member);
    return NextResponse.json({ data: safeMembers, error: null });
  } catch (error) {
    return error as Response;
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    // Only admins can create members
    if (admin.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = createMemberSchema.parse(body);

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const newMember = await db
      .insert(members)
      .values({
        email: validated.email,
        name: validated.name || null,
        passwordHash,
        role: validated.role,
        isActive: validated.isActive,
      })
      .returning();

    // Don't return password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeMember } = newMember[0];
    return NextResponse.json({ data: safeMember, error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error creating member:", error);
    return NextResponse.json({ data: null, error: "Failed to create member" }, { status: 500 });
  }
}

