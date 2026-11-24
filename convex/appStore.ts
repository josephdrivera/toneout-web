"use node";

import { createSign } from "crypto";
import { gunzipSync } from "zlib";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Daily App Store numbers for the admin Stats tab, read from Apple's Sales
 * and Trends summary report with a Sales-and-Reports-only API key.
 *
 * Needs on the Convex deployment: ASC_KEY_P8_B64 (the .p8 file, base64),
 * ASC_KEY_ID, ASC_ISSUER_ID, ASC_VENDOR.
 */

const SOURCE = "app-store";
const DAY_MS = 86400000;

function token(): string | null {
  const key = process.env.ASC_KEY_P8_B64;
  const kid = process.env.ASC_KEY_ID;
  const iss = process.env.ASC_ISSUER_ID;
  if (!key || !kid || !iss) return null;
  const part = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${part({ alg: "ES256", kid, typ: "JWT" })}.${part({
    iss,
    iat: now,
    exp: now + 900,
    aud: "appstoreconnect-v1",
  })}`;
  const signature = createSign("SHA256")
    .update(unsigned)
    .sign(
      {
        key: Buffer.from(key, "base64").toString("utf8"),
        dsaEncoding: "ieee-p1363",
      },
      "base64url",
    );
  return `${unsigned}.${signature}`;
}

/**
 * Turns one day's report into counts. Product type identifiers: 1* and F1 are
 * first-time downloads, 3* re-downloads, 7* updates, IA* in-app purchases.
 * Refunds arrive as negative units and are counted separately.
 */
export function summarize(tsv: string): Record<string, number> {
  const metrics: Record<string, number> = {
    downloads: 0,
    downloads_iphone: 0,
    downloads_ipad: 0,
    redownloads: 0,
    updates: 0,
    purchases: 0,
    refunds: 0,
    proceeds_usd: 0,
  };
  const lines = tsv.split("\n").filter((line) => line.trim());
  const header = lines[0]?.split("\t") ?? [];
  const col = (name: string) => header.indexOf(name);
  const iType = col("Product Type Identifier");
  const iUnits = col("Units");
  const iProceeds = col("Developer Proceeds");
  const iCurrency = col("Currency of Proceeds");
  const iDevice = col("Device");
  const iSku = col("SKU");
  if (iType < 0 || iUnits < 0) return metrics;

  for (const line of lines.slice(1)) {
    const cells = line.split("\t");
    const type = (cells[iType] ?? "").trim();
    const units = Number(cells[iUnits]) || 0;
    if (type.startsWith("IA")) {
      if (units < 0) {
        metrics.refunds += -units;
      } else {
        metrics.purchases += units;
        const sku = (cells[iSku] ?? "").trim().toLowerCase();
        if (/^[a-z0-9][a-z0-9._-]{0,60}$/.test(sku)) {
          metrics[`iap:${sku}`] = (metrics[`iap:${sku}`] ?? 0) + units;
        }
      }
      if ((cells[iCurrency] ?? "").trim() === "USD") {
        metrics.proceeds_usd += units * (Number(cells[iProceeds]) || 0);
      }
    } else if (type.startsWith("7")) {
      metrics.updates += units;
    } else if (type.startsWith("3")) {
      metrics.redownloads += units;
    } else if (type.startsWith("1") || type === "F1") {
      metrics.downloads += units;
      const device = (cells[iDevice] ?? "").trim();
      if (device === "iPad") metrics.downloads_ipad += units;
      else if (device === "iPhone") metrics.downloads_iphone += units;
    }
  }
  metrics.proceeds_usd = Math.round(metrics.proceeds_usd * 100) / 100;
  return metrics;
}

/**
 * Fetches `days` daily reports ending `offset` days before yesterday and saves
 * each. The twice-daily cron re-reads the last few days because Apple posts
 * late and corrects recent days.
 */
export const pull = internalAction({
  args: { days: v.optional(v.number()), offset: v.optional(v.number()) },
  returns: v.object({
    saved: v.number(),
    empty: v.number(),
    pending: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx, args) => {
    const result = { saved: 0, empty: 0, pending: 0, failed: 0 };
    const jwt = token();
    const vendor = process.env.ASC_VENDOR;
    if (!jwt || !vendor) {
      console.log("App Store stats: not configured, skipping");
      return result;
    }
    const days = Math.max(1, Math.min(args.days ?? 5, 120));
    const offset = Math.max(0, args.offset ?? 0);

    for (let back = 1 + offset; back <= days + offset; back += 1) {
      const date = new Date(Date.now() - back * DAY_MS)
        .toISOString()
        .slice(0, 10);
      const query = new URLSearchParams({
        "filter[frequency]": "DAILY",
        "filter[reportType]": "SALES",
        "filter[reportSubType]": "SUMMARY",
        "filter[vendorNumber]": vendor,
        "filter[reportDate]": date,
        "filter[version]": "1_0",
      });
      const response = await fetch(
        `https://api.appstoreconnect.apple.com/v1/salesReports?${query}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: "application/a-gzip",
          },
        },
      );
      const body = Buffer.from(await response.arrayBuffer());
      let metrics: Record<string, number> | null = null;
      if (response.ok) {
        metrics = summarize(gunzipSync(body).toString("utf8"));
        result.saved += 1;
      } else if (
        response.status === 404 &&
        /no sales/i.test(body.toString("utf8"))
      ) {
        metrics = summarize("");
        result.empty += 1;
      } else if (response.status === 404) {
        result.pending += 1; // report not posted yet
      } else if (response.status === 410) {
        break; // older than Apple keeps daily reports (about a year)
      } else {
        result.failed += 1;
        console.log(`App Store stats: ${date} HTTP ${response.status}`);
        if (response.status === 401 || response.status === 403) break;
      }
      if (metrics) {
        await ctx.runMutation(internal.stats.recordInternal, {
          source: SOURCE,
          date,
          metrics,
        });
      }
    }
    console.log(`App Store stats: ${JSON.stringify(result)}`);
    return result;
  },
});
