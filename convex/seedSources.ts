import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { SourceType } from "./lib/taxonomy";

type SeedSource = {
  name: string;
  type: SourceType;
  url: string;
  trustLevel: number;
  defaultState?: string;
  defaultTown?: string;
  defaultCounty?: string;
  department?: string;
  pollIntervalMinutes: number;
};

/**
 * Starter sources. Every URL must be verified by the editor before being
 * trusted — municipal and state RSS endpoints move around. Run with:
 *   npx convex run seedSources:seed
 */
const SEED_SOURCES: SeedSource[] = [
  {
    // WordPress-based national fire-service publication; /feed is a
    // reliable real RSS endpoint, useful for exercising ingestion.
    name: "FirefighterNation",
    type: "rss",
    url: "https://www.firefighternation.com/feed/",
    trustLevel: 2,
    pollIntervalMinutes: 30,
  },
  {
    name: "FireRescue1",
    type: "rss",
    url: "https://www.firerescue1.com/rss",
    trustLevel: 2,
    pollIntervalMinutes: 30,
  },
  {
    // VERIFY: ct.gov press-release RSS endpoints change; confirm the
    // current DEMHS/state feed URL before trusting.
    name: "CT DEMHS News",
    type: "rss",
    url: "https://portal.ct.gov/demhs/rss",
    trustLevel: 1,
    defaultState: "CT",
    pollIntervalMinutes: 15,
  },
  {
    // VERIFY: CivicPlus municipal sites expose RSS at /rss.aspx; confirm
    // the module ID for the town news feed.
    name: "Town of Glastonbury News",
    type: "rss",
    url: "https://www.glastonbury-ct.gov/rss.aspx",
    trustLevel: 1,
    defaultState: "CT",
    defaultTown: "Glastonbury",
    defaultCounty: "Hartford",
    department: "Glastonbury Fire Department",
    pollIntervalMinutes: 15,
  },
  {
    // VERIFY: Patch regional feed URL. Trust 3 exercises the held
    // review queue path.
    name: "Patch — Across Connecticut",
    type: "rss",
    url: "https://patch.com/connecticut/across-ct/rss.xml",
    trustLevel: 3,
    defaultState: "CT",
    pollIntervalMinutes: 20,
  },
];

export const seed = internalMutation({
  args: {},
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;
    for (const source of SEED_SOURCES) {
      const existing = await ctx.db
        .query("sources")
        .withIndex("by_url", (q) => q.eq("url", source.url))
        .unique();
      if (existing) {
        skipped++;
        continue;
      }
      const sourceId = await ctx.db.insert("sources", {
        ...source,
        enabled: true,
        failureCount: 0,
        needsUrlVerification: true,
      });
      await ctx.db.insert("auditLog", {
        actor: "system",
        action: "source.seeded",
        sourceId,
        at: Date.now(),
        after: JSON.stringify({ name: source.name, url: source.url }),
      });
      inserted++;
    }
    return { inserted, skipped };
  },
});
