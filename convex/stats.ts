import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertEditorSecret } from "./lib/editorAuth";

/**
 * Daily app numbers shown on the admin Stats tab. Secret-gated like the
 * other admin functions. Rows hold counts only.
 */

export const record = mutation({
  args: {
    secret: v.string(),
    source: v.string(),
    date: v.string(),
    metrics: v.record(v.string(), v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const existing = await ctx.db
      .query("appStats")
      .withIndex("by_source_date", (q) =>
        q.eq("source", args.source).eq("date", args.date),
      )
      .unique();
    const row = { at: Date.now(), metrics: args.metrics };
    if (existing) {
      await ctx.db.patch(existing._id, row);
    } else {
      await ctx.db.insert("appStats", {
        source: args.source,
        date: args.date,
        ...row,
      });
    }
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
