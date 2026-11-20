import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  ActionCtx,
  internalAction,
  internalMutation,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { classifyCategory, matchTown } from "./lib/classify";
import { parseFeed } from "./lib/rss";
import { normalizeLink, normalizeTitle, titleSimilarity } from "./lib/text";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_ITEMS_PER_POLL = 50;
const FETCH_CONCURRENCY = 5;
const DUPLICATE_WINDOW_MS = 12 * 60 * 60 * 1000;
const DUPLICATE_SIMILARITY_THRESHOLD = 0.65;

const itemValidator = v.object({
  guid: v.string(),
  link: v.string(),
  title: v.string(),
  summary: v.string(),
  publishedAt: v.number(),
});

type FeedItem = {
  guid: string;
  link: string;
  title: string;
  summary: string;
  publishedAt: number;
};

async function fetchAndParse(url: string): Promise<FeedItem[]> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ToneOutNewsBot/1.0 (+https://toneout.app/news)",
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.5",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    throw new Error(`Feed body too large (${contentLength} bytes)`);
  }
  const text = await response.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new Error(`Feed body too large (${text.length} chars)`);
  }
  return parseFeed(text).slice(0, MAX_ITEMS_PER_POLL);
}

async function pollOne(
  ctx: ActionCtx,
  source: Doc<"sources">,
): Promise<{ inserted: number; pendingCreated: number }> {
  try {
    const items = await fetchAndParse(source.url);
    const result = await ctx.runMutation(internal.ingest.recordItems, {
      sourceId: source._id,
      items,
    });
    await ctx.runMutation(internal.sources.markPolled, {
      sourceId: source._id,
      ok: true,
      hadNewItems: result.inserted > 0,
    });
    return result;
  } catch (error) {
    await ctx.runMutation(internal.sources.markPolled, {
      sourceId: source._id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      hadNewItems: false,
    });
    return { inserted: 0, pendingCreated: 0 };
  }
}

export const pollDueSources = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const due = await ctx.runQuery(internal.sources.getDue, {
      now: Date.now(),
    });
    if (due.length === 0) return null;

    let pendingCreated = 0;
    for (let i = 0; i < due.length; i += FETCH_CONCURRENCY) {
      const chunk = due.slice(i, i + FETCH_CONCURRENCY);
      const results = await Promise.allSettled(
        chunk.map((source) => pollOne(ctx, source)),
      );
      for (const result of results) {
        if (result.status === "fulfilled") {
          pendingCreated += result.value.pendingCreated;
        }
      }
    }

    if (pendingCreated > 0) {
      await ctx.runAction(internal.notifications.maybeNotifyEditor, {});
    }
    return null;
  },
});

/** Manual/testing entry point: `npx convex run ingest:pollSourceNow '{"sourceId":"..."}'` */
export const pollSourceNow = internalAction({
  args: { sourceId: v.id("sources") },
  returns: v.object({ inserted: v.number(), pendingCreated: v.number() }),
  handler: async (
    ctx,
    args,
  ): Promise<{ inserted: number; pendingCreated: number }> => {
    const source: Doc<"sources"> | null = await ctx.runQuery(
      internal.sources.getById,
      { sourceId: args.sourceId },
    );
    if (!source) throw new Error("Source not found");
    return await pollOne(ctx, source);
  },
});

export const recordItems = internalMutation({
  args: {
    sourceId: v.id("sources"),
    items: v.array(itemValidator),
  },
  returns: v.object({ inserted: v.number(), pendingCreated: v.number() }),
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Source not found");

    let inserted = 0;
    let pendingCreated = 0;

    for (const item of args.items) {
      const guid = item.guid || item.link;
      if (!guid) continue;

      const byGuid = await ctx.db
        .query("alerts")
        .withIndex("by_source_guid", (q) =>
          q.eq("sourceId", args.sourceId).eq("guid", guid),
        )
        .unique();
      if (byGuid) continue;

      const normalized = normalizeLink(item.link);
      const byLink = await ctx.db
        .query("alerts")
        .withIndex("by_normalizedLink", (q) => q.eq("normalizedLink", normalized))
        .first();
      if (byLink) continue;

      const category = classifyCategory(item.title, item.summary);
      const state = source.defaultState;
      const town =
        source.defaultTown ??
        matchTown(`${item.title} ${item.summary}`, state ?? "CT") ??
        undefined;

      // Cross-source duplicate suggestion — flag for the editor, never auto-merge.
      const normalizedTitle = normalizeTitle(item.title);
      const nearby = await ctx.db
        .query("alerts")
        .withIndex("by_publishedAt", (q) =>
          q
            .gte("publishedAt", item.publishedAt - DUPLICATE_WINDOW_MS)
            .lte("publishedAt", item.publishedAt + DUPLICATE_WINDOW_MS),
        )
        .collect();
      let possibleDuplicateOf: Id<"alerts"> | undefined;
      for (const candidate of nearby) {
        if (candidate.sourceId === args.sourceId) continue;
        const sameTown =
          (town && candidate.town && town === candidate.town) ||
          (!town && !candidate.town && state && candidate.state === state);
        if (!sameTown) continue;
        if (
          titleSimilarity(normalizedTitle, candidate.normalizedTitle) >=
          DUPLICATE_SIMILARITY_THRESHOLD
        ) {
          possibleDuplicateOf = candidate._id;
          break;
        }
      }

      // Trust-level matrix.
      const isAutoPublished = source.trustLevel <= 2;
      const status = isAutoPublished ? "published" : "pending";
      const verification = source.trustLevel === 1 ? "official" : "automated";
      const reviewFlag =
        source.trustLevel >= 2 || possibleDuplicateOf !== undefined;

      const now = Date.now();
      const alertId = await ctx.db.insert("alerts", {
        sourceId: args.sourceId,
        guid,
        link: item.link || guid,
        normalizedLink: normalized,
        title: item.title,
        normalizedTitle,
        summary: item.summary,
        publishedAt: item.publishedAt,
        detectedAt: now,
        updatedAt: now,
        category,
        town,
        state,
        county: source.defaultCounty,
        department: source.department,
        status,
        verification,
        reviewFlag,
        possibleDuplicateOf,
      });
      await ctx.db.insert("auditLog", {
        actor: "system",
        action: "alert.created",
        alertId,
        sourceId: args.sourceId,
        at: now,
        after: JSON.stringify({
          title: item.title,
          category,
          status,
          verification,
          reviewFlag,
          possibleDuplicate: possibleDuplicateOf !== undefined,
        }).slice(0, 500),
      });

      inserted++;
      if (status === "pending" || reviewFlag) pendingCreated++;
    }

    return { inserted, pendingCreated };
  },
});
