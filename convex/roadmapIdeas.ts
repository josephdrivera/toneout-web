import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: { idea: v.string(), email: v.optional(v.string()) },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const idea = args.idea.trim();
    if (!idea) {
      return { success: false };
    }
    const email = args.email?.trim().toLowerCase();

    await ctx.db.insert("roadmapIdeas", {
      idea,
      ...(email ? { email } : {}),
      submittedAt: Date.now(),
    });

    return { success: true };
  },
});

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("roadmapIdeas"),
      _creationTime: v.number(),
      idea: v.string(),
      email: v.optional(v.string()),
      submittedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query("roadmapIdeas")
      .withIndex("by_submittedAt")
      .order("desc")
      .collect();
  },
});
