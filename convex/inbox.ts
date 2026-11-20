import { query } from "./_generated/server";
import { v } from "convex/values";
import { assertEditorSecret } from "./lib/editorAuth";

/**
 * Everything people have sent through the site's forms, for the admin Inbox:
 * requests / feedback / bug reports, roadmap ideas and waitlist sign-ups.
 * (Host a Node requests live on the Nodes page.) Read-only, secret-gated.
 */
export const overview = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const feedback = await ctx.db
      .query("feedback")
      .withIndex("by_submittedAt")
      .order("desc")
      .take(200);
    const ideas = await ctx.db
      .query("roadmapIdeas")
      .withIndex("by_submittedAt")
      .order("desc")
      .take(200);
    const waitlist = await ctx.db.query("waitlist").order("desc").take(500);
    return {
      feedback: feedback.map((row) => ({
        _id: row._id,
        topic: row.topic,
        message: row.message,
        email: row.email,
        platform: row.platform,
        at: row.submittedAt,
      })),
      ideas: ideas.map((row) => ({
        _id: row._id,
        idea: row.idea,
        email: row.email,
        at: row.submittedAt,
      })),
      waitlist: waitlist.map((row) => ({
        _id: row._id,
        email: row.email,
        platform: row.platform,
        at: row.joinedAt,
      })),
    };
  },
});
