import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { assertEditorSecret } from "./lib/editorAuth";
import {
  MAX_TRUST_LEVEL,
  MIN_TRUST_LEVEL,
  sourceTypeValidator,
} from "./lib/taxonomy";

const MAX_SOURCES_PER_TICK = 20;
const MAX_BACKOFF_EXPONENT = 5;

const sourceFields = {
  name: v.string(),
  type: sourceTypeValidator,
  url: v.string(),
  trustLevel: v.number(),
  defaultState: v.optional(v.string()),
  defaultTown: v.optional(v.string()),
  defaultCounty: v.optional(v.string()),
  department: v.optional(v.string()),
  pollIntervalMinutes: v.number(),
};

function validateSourceInput(args: {
  url: string;
  trustLevel: number;
  pollIntervalMinutes: number;
}) {
  if (
    args.trustLevel < MIN_TRUST_LEVEL ||
    args.trustLevel > MAX_TRUST_LEVEL ||
    !Number.isInteger(args.trustLevel)
  ) {
    throw new Error(`trustLevel must be an integer ${MIN_TRUST_LEVEL}-${MAX_TRUST_LEVEL}`);
  }
  if (!/^https?:\/\//i.test(args.url)) {
    throw new Error("url must be an http(s) URL");
  }
  if (args.pollIntervalMinutes < 1) {
    throw new Error("pollIntervalMinutes must be at least 1");
  }
}

/** Enabled sources due for polling, with exponential backoff on failures. */
export const getDue = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const enabled = await ctx.db
      .query("sources")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect();

    const due = enabled.filter((source) => {
      if (source.lastPolledAt === undefined) return true;
      const backoff = Math.pow(
        2,
        Math.min(source.failureCount, MAX_BACKOFF_EXPONENT),
      );
      const intervalMs = source.pollIntervalMinutes * backoff * 60_000;
      return args.now >= source.lastPolledAt + intervalMs;
    });

    due.sort((a, b) => (a.lastPolledAt ?? 0) - (b.lastPolledAt ?? 0));
    return due.slice(0, MAX_SOURCES_PER_TICK);
  },
});

export const getById = internalQuery({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sourceId);
  },
});

export const markPolled = internalMutation({
  args: {
    sourceId: v.id("sources"),
    ok: v.boolean(),
    error: v.optional(v.string()),
    hadNewItems: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) return null;

    const now = Date.now();
    if (args.ok) {
      await ctx.db.patch(args.sourceId, {
        lastPolledAt: now,
        failureCount: 0,
        lastError: undefined,
        ...(args.hadNewItems ? { lastItemAt: now } : {}),
      });
    } else {
      const failureCount = source.failureCount + 1;
      await ctx.db.patch(args.sourceId, {
        lastPolledAt: now,
        failureCount,
        lastError: args.error?.slice(0, 500),
      });
      // Log at escalation thresholds only — not every failed poll.
      if (failureCount === 5 || failureCount === 20) {
        await ctx.db.insert("auditLog", {
          actor: "system",
          action: "source.pollFailed",
          sourceId: args.sourceId,
          at: now,
          after: JSON.stringify({
            failureCount,
            error: args.error?.slice(0, 300),
          }),
        });
      }
    }
    return null;
  },
});

export const create = mutation({
  args: { secret: v.string(), ...sourceFields },
  returns: v.id("sources"),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    validateSourceInput(args);

    const existing = await ctx.db
      .query("sources")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();
    if (existing) {
      throw new Error("A source with this URL already exists");
    }

    const sourceId = await ctx.db.insert("sources", {
      name: args.name,
      type: args.type,
      url: args.url,
      trustLevel: args.trustLevel,
      defaultState: args.defaultState,
      defaultTown: args.defaultTown,
      defaultCounty: args.defaultCounty,
      department: args.department,
      pollIntervalMinutes: args.pollIntervalMinutes,
      enabled: true,
      failureCount: 0,
    });
    await ctx.db.insert("auditLog", {
      actor: "editor",
      action: "source.created",
      sourceId,
      at: Date.now(),
      after: JSON.stringify({ name: args.name, url: args.url, trustLevel: args.trustLevel }),
    });
    return sourceId;
  },
});

export const update = mutation({
  args: {
    secret: v.string(),
    sourceId: v.id("sources"),
    name: v.optional(v.string()),
    trustLevel: v.optional(v.number()),
    defaultState: v.optional(v.string()),
    defaultTown: v.optional(v.string()),
    defaultCounty: v.optional(v.string()),
    department: v.optional(v.string()),
    pollIntervalMinutes: v.optional(v.number()),
    needsUrlVerification: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Source not found");

    const { sourceId } = args;
    const patch = Object.fromEntries(
      Object.entries({
        name: args.name,
        trustLevel: args.trustLevel,
        defaultState: args.defaultState,
        defaultTown: args.defaultTown,
        defaultCounty: args.defaultCounty,
        department: args.department,
        pollIntervalMinutes: args.pollIntervalMinutes,
        needsUrlVerification: args.needsUrlVerification,
      }).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(patch).length === 0) return null;

    validateSourceInput({
      url: source.url,
      trustLevel: (patch.trustLevel as number) ?? source.trustLevel,
      pollIntervalMinutes:
        (patch.pollIntervalMinutes as number) ?? source.pollIntervalMinutes,
    });

    await ctx.db.patch(sourceId, patch);
    await ctx.db.insert("auditLog", {
      actor: "editor",
      action: "source.updated",
      sourceId,
      at: Date.now(),
      before: JSON.stringify(
        Object.fromEntries(
          Object.keys(patch).map((key) => [key, source[key as keyof typeof source]]),
        ),
      ).slice(0, 500),
      after: JSON.stringify(patch).slice(0, 500),
    });
    return null;
  },
});

export const setEnabled = mutation({
  args: {
    secret: v.string(),
    sourceId: v.id("sources"),
    enabled: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Source not found");
    if (source.enabled === args.enabled) return null;

    await ctx.db.patch(args.sourceId, { enabled: args.enabled });
    await ctx.db.insert("auditLog", {
      actor: "editor",
      action: args.enabled ? "source.enabled" : "source.disabled",
      sourceId: args.sourceId,
      at: Date.now(),
    });
    return null;
  },
});

export const listAll = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    return await ctx.db.query("sources").collect();
  },
});

/**
 * Public, name-only view of the source list for the News page: which
 * sources are delivering items and which are still being set up.
 */
export const listPublicStatus = query({
  args: {},
  returns: v.array(
    v.object({
      name: v.string(),
      status: v.union(v.literal("live"), v.literal("comingSoon")),
    }),
  ),
  handler: async (ctx) => {
    const sources = await ctx.db.query("sources").collect();
    return sources
      .map((source) => ({
        name: source.name,
        status:
          source.enabled &&
          source.lastItemAt !== undefined &&
          source.failureCount < 3
            ? ("live" as const)
            : ("comingSoon" as const),
      }))
      .sort(
        (a, b) =>
          Number(b.status === "live") - Number(a.status === "live") ||
          a.name.localeCompare(b.name),
      );
  },
});
