import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { assertEditorSecret } from "./lib/editorAuth";
import { categoryValidator, verificationValidator } from "./lib/taxonomy";

type AlertWithSource = Doc<"alerts"> & {
  sourceName: string;
  sourceTrustLevel: number;
};

async function joinSources(
  ctx: QueryCtx,
  alerts: Doc<"alerts">[],
): Promise<AlertWithSource[]> {
  const sourceIds = [...new Set(alerts.map((a) => a.sourceId))];
  const sources = new Map<Id<"sources">, Doc<"sources">>();
  for (const sourceId of sourceIds) {
    const source = await ctx.db.get(sourceId);
    if (source) sources.set(sourceId, source);
  }
  return alerts.map((alert) => {
    const source = sources.get(alert.sourceId);
    return {
      ...alert,
      sourceName: source?.name ?? "Unknown source",
      sourceTrustLevel: source?.trustLevel ?? 4,
    };
  });
}

export const listPublished = query({
  args: {
    paginationOpts: paginationOptsValidator,
    state: v.optional(v.string()),
    category: v.optional(categoryValidator),
    verification: v.optional(verificationValidator),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("alerts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
      .order("desc")
      .paginate(args.paginationOpts);

    // Post-filtering a page can return short pages, but pagination cursors
    // stay correct and volume is modest in phase 1.
    const filtered = page.page.filter((alert) => {
      if (alert.duplicateOf !== undefined) return false;
      if (args.state && alert.state !== args.state) return false;
      if (args.category && alert.category !== args.category) return false;
      if (args.verification && alert.verification !== args.verification) {
        return false;
      }
      return true;
    });

    return { ...page, page: await joinSources(ctx, filtered) };
  },
});

export const listReviewQueue = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);

    const pending = await ctx.db
      .query("alerts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(100);

    const flagged = (
      await ctx.db
        .query("alerts")
        .withIndex("by_reviewFlag", (q) => q.eq("reviewFlag", true))
        .order("desc")
        .take(200)
    ).filter((alert) => alert.status === "published");

    const withSources = await joinSources(ctx, [...pending, ...flagged]);

    // Attach the suggested duplicate's title/link for the editor callout.
    return await Promise.all(
      withSources.map(async (alert) => {
        if (!alert.possibleDuplicateOf) {
          return { ...alert, duplicateCandidate: null };
        }
        const candidate = await ctx.db.get(alert.possibleDuplicateOf);
        return {
          ...alert,
          duplicateCandidate: candidate
            ? { _id: candidate._id, title: candidate.title, link: candidate.link }
            : null,
        };
      }),
    );
  },
});

async function getAlertOrThrow(
  ctx: { db: { get: (id: Id<"alerts">) => Promise<Doc<"alerts"> | null> } },
  alertId: Id<"alerts">,
): Promise<Doc<"alerts">> {
  const alert = await ctx.db.get(alertId);
  if (!alert) throw new Error("Alert not found");
  return alert;
}

export const approve = mutation({
  args: { secret: v.string(), alertId: v.id("alerts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const alert = await getAlertOrThrow(ctx, args.alertId);
    await ctx.db.patch(args.alertId, {
      status: "published",
      reviewFlag: false,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("auditLog", {
      actor: "editor",
      action: "alert.approved",
      alertId: args.alertId,
      at: Date.now(),
      before: JSON.stringify({ status: alert.status, reviewFlag: alert.reviewFlag }),
      after: JSON.stringify({ status: "published", reviewFlag: false }),
    });
    return null;
  },
});

export const reject = mutation({
  args: { secret: v.string(), alertId: v.id("alerts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const alert = await getAlertOrThrow(ctx, args.alertId);
    await ctx.db.patch(args.alertId, {
      status: "rejected",
      reviewFlag: false,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("auditLog", {
      actor: "editor",
      action: "alert.rejected",
      alertId: args.alertId,
      at: Date.now(),
      before: JSON.stringify({ status: alert.status }),
      after: JSON.stringify({ status: "rejected" }),
    });
    return null;
  },
});

export const updateDetails = mutation({
  args: {
    secret: v.string(),
    alertId: v.id("alerts"),
    town: v.optional(v.string()),
    state: v.optional(v.string()),
    county: v.optional(v.string()),
    category: v.optional(categoryValidator),
    department: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const alert = await getAlertOrThrow(ctx, args.alertId);

    const { alertId } = args;
    const patch = Object.fromEntries(
      Object.entries({
        town: args.town,
        state: args.state,
        county: args.county,
        category: args.category,
        department: args.department,
      }).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(patch).length === 0) return null;

    await ctx.db.patch(alertId, { ...patch, updatedAt: Date.now() });
    await ctx.db.insert("auditLog", {
      actor: "editor",
      action: "alert.edited",
      alertId,
      at: Date.now(),
      before: JSON.stringify(
        Object.fromEntries(
          Object.keys(patch).map((key) => [key, alert[key as keyof typeof alert]]),
        ),
      ).slice(0, 500),
      after: JSON.stringify(patch).slice(0, 500),
    });
    return null;
  },
});

export const setVerification = mutation({
  args: {
    secret: v.string(),
    alertId: v.id("alerts"),
    verification: verificationValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const alert = await getAlertOrThrow(ctx, args.alertId);
    if (alert.verification === args.verification) return null;

    await ctx.db.patch(args.alertId, {
      verification: args.verification,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("auditLog", {
      actor: "editor",
      action: "alert.verificationChanged",
      alertId: args.alertId,
      at: Date.now(),
      before: JSON.stringify({ verification: alert.verification }),
      after: JSON.stringify({ verification: args.verification }),
    });
    return null;
  },
});

export const markDuplicate = mutation({
  args: {
    secret: v.string(),
    alertId: v.id("alerts"),
    duplicateOf: v.id("alerts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    if (args.alertId === args.duplicateOf) {
      throw new Error("An alert cannot be a duplicate of itself");
    }
    await getAlertOrThrow(ctx, args.alertId);
    const target = await ctx.db.get(args.duplicateOf);
    if (!target) throw new Error("Duplicate target not found");
    if (target.duplicateOf) {
      throw new Error("Target is itself marked as a duplicate");
    }

    await ctx.db.patch(args.alertId, {
      duplicateOf: args.duplicateOf,
      reviewFlag: false,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("auditLog", {
      actor: "editor",
      action: "alert.markedDuplicate",
      alertId: args.alertId,
      at: Date.now(),
      after: JSON.stringify({ duplicateOf: args.duplicateOf }),
    });
    return null;
  },
});

export const clearReviewFlag = mutation({
  args: { secret: v.string(), alertId: v.id("alerts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const alert = await getAlertOrThrow(ctx, args.alertId);
    if (!alert.reviewFlag) return null;

    await ctx.db.patch(args.alertId, {
      reviewFlag: false,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("auditLog", {
      actor: "editor",
      action: "alert.reviewFlagCleared",
      alertId: args.alertId,
      at: Date.now(),
    });
    return null;
  },
});
