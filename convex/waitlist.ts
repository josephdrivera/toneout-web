import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const platformValidator = v.union(v.literal("ios"), v.literal("android"));

export const join = mutation({
  args: { email: v.string(), platform: v.optional(platformValidator) },
  returns: v.object({
    success: v.boolean(),
    alreadyJoined: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      if (args.platform && existing.platform !== args.platform) {
        await ctx.db.patch(existing._id, { platform: args.platform });
      }

      return { success: true, alreadyJoined: true };
    }

    await ctx.db.insert("waitlist", {
      email,
      ...(args.platform ? { platform: args.platform } : {}),
      joinedAt: Date.now(),
    });

    return { success: true, alreadyJoined: false };
  },
});

export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const all = await ctx.db.query("waitlist").collect();
    return all.length;
  },
});
