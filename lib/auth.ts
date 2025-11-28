import { NextRequest } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

const SESSION_SECRET = process.env.SESSION_SECRET || "in-nutri-admin-secret-key-change-in-production";
const SESSION_COOKIE_NAME = "in_admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

// 使用 Web Crypto API（Edge Runtime 兼容）
async function signToken(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET);
  const messageData = encoder.encode(data);
  
  // 导入密钥
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  // 签名
  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  
  return `${data}.${signatureHex}`;
}

async function verifyToken(token: string): Promise<string | null> {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET);
  const messageData = encoder.encode(data);
  
  // 导入密钥
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  
  // 验证签名
  const signatureBytes = new Uint8Array(
    signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  
  const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, messageData);
  
  if (!isValid) return null;
  return data;
}

export async function createSession(memberId: number): Promise<string> {
  const tokenData = JSON.stringify({
    memberId,
    expiresAt: Date.now() + SESSION_DURATION,
  });
  return await signToken(tokenData);
}

export async function parseAdminFromRequest(request: NextRequest): Promise<AdminUser | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  const tokenData = await verifyToken(sessionCookie.value);
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

  const tokenData = await verifyToken(cookieValue);
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

