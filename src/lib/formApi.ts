import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildSubmissionNotificationEmail } from "./waitlist-email";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MAX_EMAIL_LENGTH = 254;

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;

/** Per-route, per-IP limiter. Each route keeps its own map. */
export function createRateLimiter(): (request: Request) => boolean {
  const rateMap = new Map<string, number[]>();
  return (request) => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const now = Date.now();
    const recent = (rateMap.get(ip) ?? []).filter(
      (t) => now - t < RATE_WINDOW_MS,
    );
    recent.push(now);
    rateMap.set(ip, recent);
    return recent.length > RATE_LIMIT;
  };
}

/** Reads a trimmed string field from an untrusted JSON body. */
export function field(body: unknown, key: string): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

export function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Emails the submission to ADMIN_EMAIL. Returns false if it could not send. */
export async function notifyAdmin(options: {
  subject: string;
  badge: string;
  rows: Array<{ label: string; value?: string }>;
  replyTo?: string;
}): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!resendKey || !adminEmail) return false;

  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "ToneOut <onboarding@resend.dev>",
    to: adminEmail,
    subject: options.subject,
    html: buildSubmissionNotificationEmail(options.badge, options.rows),
    ...(options.replyTo ? { replyTo: options.replyTo } : {}),
  });
  if (error) {
    console.error(`${options.badge} notification error:`, error);
    return false;
  }
  return true;
}
