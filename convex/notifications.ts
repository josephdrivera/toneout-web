import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";

const DIGEST_KEY = "editor-digest";
const MIN_INTERVAL_MS = 30 * 60 * 1000;

export const getDigestState = internalQuery({
  args: {},
  returns: v.object({
    lastSentAt: v.number(),
    pendingCount: v.number(),
    flaggedCount: v.number(),
  }),
  handler: async (ctx) => {
    const state = await ctx.db
      .query("notifyState")
      .withIndex("by_key", (q) => q.eq("key", DIGEST_KEY))
      .unique();
    const lastSentAt = state?.lastSentAt ?? 0;

    const pending = await ctx.db
      .query("alerts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "pending"))
      .collect();
    const flagged = (
      await ctx.db
        .query("alerts")
        .withIndex("by_reviewFlag", (q) => q.eq("reviewFlag", true))
        .collect()
    ).filter((a) => a.status === "published");

    // Only items detected since the last digest count toward sending a new one.
    const newItems = [...pending, ...flagged].filter(
      (a) => a.detectedAt > lastSentAt,
    );

    return {
      lastSentAt,
      pendingCount: pending.length + flagged.length,
      flaggedCount: newItems.length,
    };
  },
});

export const markDigestSent = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const state = await ctx.db
      .query("notifyState")
      .withIndex("by_key", (q) => q.eq("key", DIGEST_KEY))
      .unique();
    if (state) {
      await ctx.db.patch(state._id, { lastSentAt: Date.now() });
    } else {
      await ctx.db.insert("notifyState", {
        key: DIGEST_KEY,
        lastSentAt: Date.now(),
      });
    }
    return null;
  },
});

/**
 * Send at most one review-queue digest email per 30 minutes. Silently
 * no-ops when Resend env vars are not configured (matches the site's
 * optional-email pattern). Uses raw fetch to avoid bundling the SDK.
 */
export const maybeNotifyEditor = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!apiKey || !adminEmail) return null;

    const state = await ctx.runQuery(internal.notifications.getDigestState, {});
    if (state.flaggedCount === 0) return null;
    if (Date.now() - state.lastSentAt < MIN_INTERVAL_MS) return null;

    const siteUrl = process.env.SITE_URL ?? "https://toneout.app";
    const from =
      process.env.RESEND_FROM_EMAIL ?? "ToneOut <onboarding@resend.dev>";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: adminEmail,
        subject: `ToneOut News: ${state.pendingCount} item${
          state.pendingCount === 1 ? "" : "s"
        } awaiting review`,
        html: `<p>${state.flaggedCount} new item${
          state.flaggedCount === 1 ? "" : "s"
        } landed in the review queue (${state.pendingCount} total awaiting attention).</p><p><a href="${siteUrl}/editor">Open the editor review queue</a></p>`,
      }),
    });

    if (response.ok) {
      await ctx.runMutation(internal.notifications.markDigestSent, {});
    }
    return null;
  },
});
