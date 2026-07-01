import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlist: defineTable({
    email: v.string(),
    platform: v.optional(v.union(v.literal("ios"), v.literal("android"))),
    joinedAt: v.number(),
  }).index("by_email", ["email"]),

  roadmapIdeas: defineTable({
    idea: v.string(),
    email: v.optional(v.string()),
    submittedAt: v.number(),
  }).index("by_submittedAt", ["submittedAt"]),
});
