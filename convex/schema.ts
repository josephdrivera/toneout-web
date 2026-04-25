import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlist: defineTable({
    email: v.string(),
    platform: v.optional(v.union(v.literal("ios"), v.literal("android"))),
    joinedAt: v.number(),
  }).index("by_email", ["email"]),
});
