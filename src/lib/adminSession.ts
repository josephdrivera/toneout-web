import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { EDITOR_COOKIE, verifySessionCookie } from "./editorSession";

/**
 * Per-person sessions for the private /admin area (node fleet).
 *
 * The cookie is `<payload>.<signature>`: payload is base64url JSON
 * `{ uid, exp }`, signed with HMAC-SHA256 keyed by EDITOR_SECRET (the same
 * server secret that gates the Convex admin functions). Every request also
 * re-checks the account in Convex, so disabling someone takes effect at once.
 */

export const ADMIN_COOKIE = "toneout_admin";
export const ADMIN_COOKIE_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

export const MIN_PASSWORD_LENGTH = 10;
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CLAIM_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type AdminUser = {
  _id: Id<"adminUsers">;
  email: string;
  name: string;
  role: "owner" | "admin";
};

export function serverSecret(): string | null {
  return process.env.EDITOR_SECRET || null;
}

export function convexClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  return url ? new ConvexHttpClient(url) : null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`toneout-admin-v1.${payload}`)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function makeAdminSession(uid: string): string | null {
  const secret = serverSecret();
  if (!secret) return null;
  const payload = Buffer.from(
    JSON.stringify({
      uid,
      exp: Date.now() + ADMIN_COOKIE_MAX_AGE_SECONDS * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function readSessionUid(cookieValue: string | undefined): string | null {
  const secret = serverSecret();
  if (!secret || !cookieValue) return null;
  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, sign(payload, secret))) return null;
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (typeof parsed !== "object" || parsed === null) return null;
    const { uid, exp } = parsed as { uid?: unknown; exp?: unknown };
    if (typeof uid !== "string" || typeof exp !== "number") return null;
    return exp > Date.now() ? uid : null;
  } catch {
    return null;
  }
}

/** The signed-in admin, or null. Checks the account is still enabled. */
export async function currentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const uid = readSessionUid(cookieStore.get(ADMIN_COOKIE)?.value);
  const secret = serverSecret();
  const convex = convexClient();
  if (!uid || !secret || !convex) return null;
  try {
    const user = await convex.query(api.admins.getById, {
      secret,
      id: uid as Id<"adminUsers">,
    });
    if (!user || user.disabled) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export function adminCookieOptions(maxAge = ADMIN_COOKIE_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

// --- Passwords: scrypt, stored as scrypt$<salt>$<hash> ---------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string | undefined) {
  if (!stored || !password) return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(
    password,
    Buffer.from(salt, "base64url"),
    expected.length,
  );
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// --- One-time tokens: invite links, claim codes, node keys -----------------

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Claim code a person can read off a phone and type on a Pi: XXXX-XXXX-XXXX. */
export function newClaimCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
  const raw = randomBytes(12);
  const chars = Array.from(raw, (byte) => alphabet[byte % alphabet.length]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars
    .slice(8, 12)
    .join("")}`;
}

export function normalizeClaimCode(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length !== 12) return "";
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
}

/**
 * The news editor accepts either its own shared-password cookie or a signed-in
 * network admin, so an admin does not need a second password.
 */
export async function hasEditorAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  if (verifySessionCookie(cookieStore.get(EDITOR_COOKIE)?.value)) return true;
  return (await currentAdmin()) !== null;
}
