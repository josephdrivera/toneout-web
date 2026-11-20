import { createHmac, timingSafeEqual } from "crypto";

export const EDITOR_COOKIE = "toneout_editor";
export const EDITOR_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const TOKEN_MESSAGE = "toneout-editor-v1";

/**
 * Stateless session token: HMAC of a fixed message keyed by EDITOR_SECRET.
 * Recomputable on every request, no session store; rotating EDITOR_SECRET
 * invalidates all sessions.
 */
export function makeSessionToken(): string | null {
  const secret = process.env.EDITOR_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(TOKEN_MESSAGE).digest("hex");
}

export function verifySessionCookie(cookieValue: string | undefined): boolean {
  const expected = makeSessionToken();
  if (!expected || !cookieValue) return false;
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyPassword(password: string): boolean {
  const secret = process.env.EDITOR_SECRET;
  if (!secret || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
