import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Resend } from "resend";
import {
  buildWaitlistEmail,
  buildAdminNotificationEmail,
} from "../../../lib/waitlist-email";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

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

    const body = await request.json();
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { error: "Backend is not configured." },
        { status: 503 },
      );
    }

    const convex = new ConvexHttpClient(convexUrl);
    const result = await convex.mutation(api.waitlist.join, { email });
    const { alreadyJoined } = result;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const fromAddress =
        process.env.RESEND_FROM_EMAIL ?? "ToneOut <onboarding@resend.dev>";

      if (!alreadyJoined) {
        const { error: confirmErr } = await resend.emails.send({
          from: fromAddress,
          to: email,
          subject: "You\u2019re on the ToneOut waitlist",
          html: buildWaitlistEmail(email),
        });
        if (confirmErr) {
          console.error("Confirmation email error:", confirmErr);
        }
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const totalCount = await convex.query(api.waitlist.count, {});
        const { error: adminErr } = await resend.emails.send({
          from: fromAddress,
          to: adminEmail,
          subject: `New waitlist signup #${totalCount}: ${email}`,
          html: buildAdminNotificationEmail(email, totalCount),
        });
        if (adminErr) {
          console.error("Admin notification error:", adminErr);
        }
      }

      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (audienceId) {
        resend.contacts
          .create({ audienceId, email })
          .catch(() => {});
      }
    }

    return NextResponse.json({ success: true, alreadyJoined });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
