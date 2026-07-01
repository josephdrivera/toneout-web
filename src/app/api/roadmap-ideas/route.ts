import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Resend } from "resend";
import { buildIdeaNotificationEmail } from "../../../lib/waitlist-email";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_IDEA_LENGTH = 2000;

const rateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  rateMap.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body: unknown = await request.json();
    const rawIdea =
      isRecord(body) && typeof body.idea === "string" ? body.idea : "";
    const rawEmail =
      isRecord(body) && typeof body.email === "string" ? body.email : "";

    const idea = rawIdea.trim();
    const email = rawEmail.trim().toLowerCase();

    if (!idea) {
      return NextResponse.json(
        { error: "Please describe your idea first." },
        { status: 400 },
      );
    }
    if (idea.length > MAX_IDEA_LENGTH) {
      return NextResponse.json(
        { error: "That's a bit long — please keep it under 2000 characters." },
        { status: 400 },
      );
    }
    // Email is optional, but if provided it must be valid.
    if (email && (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email))) {
      return NextResponse.json(
        { error: "That email doesn't look right. Leave it blank if you prefer." },
        { status: 400 },
      );
    }

    // Archive to Convex first so the idea is captured even if email fails.
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      try {
        const convex = new ConvexHttpClient(convexUrl);
        await convex.mutation(api.roadmapIdeas.submit, {
          idea,
          ...(email ? { email } : {}),
        });
      } catch (convexErr) {
        console.error("Idea archive error:", convexErr);
      }
    }

    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (resendKey && adminEmail) {
      const resend = new Resend(resendKey);
      const fromAddress =
        process.env.RESEND_FROM_EMAIL ?? "ToneOut <onboarding@resend.dev>";

      const { error: adminErr } = await resend.emails.send({
        from: fromAddress,
        to: adminEmail,
        subject: "New ToneOut roadmap idea",
        html: buildIdeaNotificationEmail(idea, email || undefined),
        ...(email && EMAIL_RE.test(email) ? { replyTo: email } : {}),
      });
      if (adminErr) {
        console.error("Idea notification error:", adminErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Roadmap ideas API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
