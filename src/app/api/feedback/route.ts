import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import {
  EMAIL_RE,
  MAX_EMAIL_LENGTH,
  badRequest,
  createRateLimiter,
  field,
  notifyAdmin,
} from "../../../lib/formApi";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 4000;
const TOPICS = ["request", "feedback", "bug"] as const;
type Topic = (typeof TOPICS)[number];
const TOPIC_LABELS: Record<Topic, string> = {
  request: "Request",
  feedback: "Feedback",
  bug: "Bug report",
};
const PLATFORM_LABELS = { ios: "iPhone (iOS)", android: "Android" } as const;

const isRateLimited = createRateLimiter();

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return badRequest("Too many requests. Please try again in a minute.", 429);
    }

    const body: unknown = await request.json();
    // Honeypot: real visitors never fill this hidden field.
    if (field(body, "website")) {
      return NextResponse.json({ success: true });
    }

    const rawTopic = field(body, "topic");
    const topic = TOPICS.find((t) => t === rawTopic) ?? "request";
    const message = field(body, "message");
    const email = field(body, "email").toLowerCase();
    const rawPlatform = field(body, "platform");
    const platform =
      rawPlatform === "ios" || rawPlatform === "android"
        ? rawPlatform
        : undefined;

    if (!message) {
      return badRequest("Please write a message first.");
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return badRequest("That's a bit long. Please keep it under 4000 characters.");
    }
    if (email && (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email))) {
      return badRequest("That email doesn't look right. Leave it blank if you prefer.");
    }

    let saved = false;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      try {
        const convex = new ConvexHttpClient(convexUrl);
        const result = await convex.mutation(api.feedback.submit, {
          topic,
          message,
          ...(email ? { email } : {}),
          ...(platform ? { platform } : {}),
        });
        saved = result.success;
      } catch (convexErr) {
        console.error("Feedback archive error:", convexErr);
      }
    }

    const emailed = await notifyAdmin({
      subject: `ToneOut ${TOPIC_LABELS[topic].toLowerCase()} from the website`,
      badge: `New ${TOPIC_LABELS[topic]}`,
      rows: [
        { label: "Message", value: message },
        { label: "From", value: email || "Anonymous (no email provided)" },
        { label: "Phone", value: platform ? PLATFORM_LABELS[platform] : undefined },
      ],
      replyTo: email || undefined,
    });

    // Only fail if the message reached neither the database nor the inbox.
    if (!saved && !emailed) {
      return badRequest("We couldn't send that. Please try again.", 500);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback API error:", err);
    return badRequest("Something went wrong. Please try again.", 500);
  }
}
