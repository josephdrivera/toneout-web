import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    topic: v.union(
      v.literal("request"),
      v.literal("feedback"),
      v.literal("bug"),
    ),
    message: v.string(),
    email: v.optional(v.string()),
    platform: v.optional(v.union(v.literal("ios"), v.literal("android"))),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const message = args.message.trim();
    if (!message) {
      return { success: false };
    }
    const email = args.email?.trim().toLowerCase();

    await ctx.db.insert("feedback", {
      topic: args.topic,
      message,
      ...(email ? { email } : {}),
      ...(args.platform ? { platform: args.platform } : {}),
      submittedAt: Date.now(),
    });

    return { success: true };
  },
});
