import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { assertEditorSecret } from "./lib/editorAuth";

/**
 * Daily app numbers shown on the admin Stats tab. Secret-gated like the
 * other admin functions. Rows hold counts only.
 */

async function upsert(
  ctx: MutationCtx,
  source: string,
  date: string,
  metrics: Record<string, number>,
) {
  const existing = await ctx.db
    .query("appStats")
    .withIndex("by_source_date", (q) => q.eq("source", source).eq("date", date))
    .unique();
  const row = { at: Date.now(), metrics };
  if (existing) {
    await ctx.db.patch(existing._id, row);
  } else {
    await ctx.db.insert("appStats", { source, date, ...row });
  }
}

const reportArgs = {
  source: v.string(),
  date: v.string(),
  metrics: v.record(v.string(), v.number()),
};

export const record = mutation({
  args: { secret: v.string(), ...reportArgs },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    await upsert(ctx, args.source, args.date, args.metrics);
    return null;
  },
});

/** Used by our own scheduled pulls (App Store, Google Play). */
export const recordInternal = internalMutation({
  args: reportArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await upsert(ctx, args.source, args.date, args.metrics);
    return null;
  },
});

/** Newest day first, up to `days` rows for one source. */
export const list = query({
  args: { secret: v.string(), source: v.string(), days: v.number() },
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    return await ctx.db
      .query("appStats")
      .withIndex("by_source_date", (q) => q.eq("source", args.source))
      .order("desc")
      .take(Math.max(1, Math.min(args.days, 400)));
  },
});
