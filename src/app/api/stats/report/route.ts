import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { convexClient, serverSecret, sha256 } from "../../../../lib/adminSession";
import { badRequest } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

const SOURCE_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const KEY_RE = /^[a-z0-9][a-z0-9:._-]{0,79}$/;
const MAX_METRICS = 80;

function keyMatches(given: string, expected: string): boolean {
  return timingSafeEqual(
    Buffer.from(sha256(given), "hex"),
    Buffer.from(sha256(expected), "hex"),
  );
}

/**
 * Daily numbers sent by our own machines (the main node today).
 *   Authorization: Bearer <STATS_REPORT_KEY>
 *   POST { source: "main-node", date: "YYYY-MM-DD", metrics: { name: count } }
 *   -> 200 { ok: true }
 * Counts only. A second report for the same day replaces the first.
 */
export async function POST(request: Request) {
  try {
    const secret = serverSecret();
    const convex = convexClient();
    const reportKey = process.env.STATS_REPORT_KEY;
    if (!secret || !convex || !reportKey) {
      return badRequest("Not configured.", 503);
    }

    const auth = request.headers.get("authorization") ?? "";
    const given = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!given || !keyMatches(given, reportKey)) {
      return badRequest("Unauthorized", 401);
    }

    const body: unknown = await request.json().catch(() => null);
    if (typeof body !== "object" || body === null) {
      return badRequest("Send a JSON object.");
    }
    const { source, date, metrics } = body as Record<string, unknown>;
    if (typeof source !== "string" || !SOURCE_RE.test(source)) {
      return badRequest("Bad source.");
    }
    if (typeof date !== "string" || !DATE_RE.test(date)) {
      return badRequest("Bad date.");
    }
    if (typeof metrics !== "object" || metrics === null || Array.isArray(metrics)) {
      return badRequest("Bad metrics.");
    }
    const entries = Object.entries(metrics as Record<string, unknown>);
    if (entries.length === 0 || entries.length > MAX_METRICS) {
      return badRequest("Bad metrics.");
    }
    const clean: Record<string, number> = {};
    for (const [key, value] of entries) {
      if (
        !KEY_RE.test(key) ||
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0
      ) {
        return badRequest(`Bad metric: ${key.slice(0, 80)}`);
      }
      clean[key] = value;
    }

    await convex.mutation(api.stats.record, {
      secret,
      source,
      date,
      metrics: clean,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}
