import { NextRequest } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "in-nutri-admin-secret-key-change-in-production";
const SESSION_COOKIE_NAME = "in_admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

function signToken(data: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(data);
  return `${data}.${hmac.digest("hex")}`;
}

function verifyToken(token: string): string | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(data);
  const expectedSignature = hmac.digest("hex");

  if (signature !== expectedSignature) return null;
  return data;
}

export async function createSession(memberId: number): Promise<string> {
  const tokenData = JSON.stringify({
    memberId,
    expiresAt: Date.now() + SESSION_DURATION,
  });
  return signToken(tokenData);
}

export async function parseAdminFromRequest(request: NextRequest): Promise<AdminUser | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  const tokenData = verifyToken(sessionCookie.value);
  if (!tokenData) return null;

  try {
    const { memberId, expiresAt } = JSON.parse(tokenData);
    if (Date.now() > expiresAt) return null;

    const member = await db.select().from(members).where(eq(members.id, memberId)).limit(1);
    if (member.length === 0 || !member[0].isActive) return null;

    return {
      id: member[0].id,
      email: member[0].email,
      name: member[0].name,
      role: member[0].role || "admin",
    };
  } catch {
    return null;
  }
}

export async function parseAdminFromCookie(cookieValue: string | undefined): Promise<AdminUser | null> {
  if (!cookieValue) return null;

  const tokenData = verifyToken(cookieValue);
  if (!tokenData) return null;

  try {
    const { memberId, expiresAt } = JSON.parse(tokenData);
    if (Date.now() > expiresAt) return null;

    const member = await db.select().from(members).where(eq(members.id, memberId)).limit(1);
    if (member.length === 0 || !member[0].isActive) return null;

    return {
      id: member[0].id,
      email: member[0].email,
      name: member[0].name,
      role: member[0].role || "admin",
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(request: NextRequest): Promise<AdminUser> {
  const admin = await parseAdminFromRequest(request);
  if (!admin) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return admin;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

