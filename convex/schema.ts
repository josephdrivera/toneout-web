import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  actorValidator,
  alertStatusValidator,
  categoryValidator,
  sourceTypeValidator,
  verificationValidator,
} from "./lib/taxonomy";

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

  sources: defineTable({
    name: v.string(),
    type: sourceTypeValidator,
    url: v.string(),
    trustLevel: v.number(),
    defaultState: v.optional(v.string()),
    defaultTown: v.optional(v.string()),
    defaultCounty: v.optional(v.string()),
    department: v.optional(v.string()),
    enabled: v.boolean(),
    pollIntervalMinutes: v.number(),
    lastPolledAt: v.optional(v.number()),
    lastItemAt: v.optional(v.number()),
    failureCount: v.number(),
    lastError: v.optional(v.string()),
    needsUrlVerification: v.optional(v.boolean()),
  })
    .index("by_enabled", ["enabled"])
    .index("by_url", ["url"]),

  alerts: defineTable({
    sourceId: v.id("sources"),
    guid: v.string(),
    link: v.string(),
    normalizedLink: v.string(),
    title: v.string(),
    normalizedTitle: v.string(),
    summary: v.string(),
    publishedAt: v.number(),
    detectedAt: v.number(),
    updatedAt: v.number(),
    category: categoryValidator,
    town: v.optional(v.string()),
    state: v.optional(v.string()),
    county: v.optional(v.string()),
    department: v.optional(v.string()),
    status: alertStatusValidator,
    verification: verificationValidator,
    reviewFlag: v.boolean(),
    possibleDuplicateOf: v.optional(v.id("alerts")),
    duplicateOf: v.optional(v.id("alerts")),
    // Phase 2 incident grouping; string because the incidents table doesn't exist yet.
    incidentId: v.optional(v.string()),
  })
    .index("by_source_guid", ["sourceId", "guid"])
    .index("by_normalizedLink", ["normalizedLink"])
    .index("by_status_publishedAt", ["status", "publishedAt"])
    .index("by_publishedAt", ["publishedAt"])
    .index("by_reviewFlag", ["reviewFlag"]),

  auditLog: defineTable({
    actor: actorValidator,
    action: v.string(),
    alertId: v.optional(v.id("alerts")),
    sourceId: v.optional(v.id("sources")),
    at: v.number(),
    before: v.optional(v.string()),
    after: v.optional(v.string()),
  })
    .index("by_at", ["at"])
    .index("by_alertId", ["alertId"]),

  notifyState: defineTable({
    key: v.string(),
    lastSentAt: v.number(),
  }).index("by_key", ["key"]),

  // --- Node network admin (private /admin area) -------------------------
  adminUsers: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin")),
    // Set once the person has chosen a password (scrypt hash made in Next).
    passwordHash: v.optional(v.string()),
    // One-time invite link: only the SHA-256 of the token is stored.
    inviteTokenHash: v.optional(v.string()),
    inviteExpiresAt: v.optional(v.number()),
    disabled: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_inviteTokenHash", ["inviteTokenHash"]),

  nodes: defineTable({
    name: v.string(),
    town: v.string(),
    hostName: v.optional(v.string()),
    inputType: v.union(v.literal("sdr"), v.literal("line-in")),
    // pending = waiting for its claim code to be used; active = licensed;
    // disabled = license revoked (heartbeats are refused).
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("disabled"),
    ),
    // Only hashes are stored; the code and key are shown or returned once.
    claimCodeHash: v.optional(v.string()),
    claimExpiresAt: v.optional(v.number()),
    keyHash: v.optional(v.string()),
    requestId: v.optional(v.id("demoRequests")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    enrolledAt: v.optional(v.number()),
    lastSeenAt: v.optional(v.number()),
    health: v.optional(
      v.object({
        version: v.optional(v.string()),
        uptimeSeconds: v.optional(v.number()),
        cpuTempC: v.optional(v.number()),
        audioLevel: v.optional(v.number()),
        lastToneAt: v.optional(v.number()),
        wifiSignal: v.optional(v.number()),
        network: v.optional(v.string()),
        channels: v.optional(v.number()),
        message: v.optional(v.string()),
      }),
    ),
  })
    .index("by_keyHash", ["keyHash"])
    .index("by_claimCodeHash", ["claimCodeHash"])
    .index("by_requestId", ["requestId"]),

  nodeEvents: defineTable({
    nodeId: v.id("nodes"),
    at: v.number(),
    type: v.string(),
    detail: v.optional(v.string()),
  }).index("by_nodeId_at", ["nodeId", "at"]),
});
