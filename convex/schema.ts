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

  feedback: defineTable({
    topic: v.union(
      v.literal("request"),
      v.literal("feedback"),
      v.literal("bug"),
    ),
    message: v.string(),
    email: v.optional(v.string()),
    platform: v.optional(v.union(v.literal("ios"), v.literal("android"))),
    submittedAt: v.number(),
  }).index("by_submittedAt", ["submittedAt"]),

  demoRequests: defineTable({
    hostType: v.optional(v.union(v.literal("firehouse"), v.literal("home"))),
    name: v.string(),
    department: v.optional(v.string()),
    town: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    message: v.optional(v.string()),
    submittedAt: v.number(),
  }).index("by_submittedAt", ["submittedAt"]),
});
