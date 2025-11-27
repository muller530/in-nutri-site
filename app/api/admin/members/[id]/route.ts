import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateMemberSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request);
    if (admin.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const member = await db.select().from(members).where(eq(members.id, parseInt(id, 10))).limit(1);

    if (member.length === 0) {
      return NextResponse.json({ data: null, error: "Member not found" }, { status: 404 });
    }

    // Don't return password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeMember } = member[0];
    return NextResponse.json({ data: safeMember, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching member:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch member" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request);
    if (admin.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateMemberSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.email !== undefined) updateData.email = validated.email;
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(validated.password, 10);
    }
    if (validated.role !== undefined) updateData.role = validated.role;
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;

    const result = await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Member not found" }, { status: 404 });
    }

    // Don't return password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeMember } = result[0];
    return NextResponse.json({ data: safeMember, error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: error.issues }, { status: 400 });
    }
    if (error instanceof Response) return error;
    console.error("Error updating member:", error);
    return NextResponse.json({ data: null, error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request);
    if (admin.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const result = await db.delete(members).where(eq(members.id, parseInt(id, 10))).returning();

    if (result.length === 0) {
      return NextResponse.json({ data: null, error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting member:", error);
    return NextResponse.json({ data: null, error: "Failed to delete member" }, { status: 500 });
  }
}

