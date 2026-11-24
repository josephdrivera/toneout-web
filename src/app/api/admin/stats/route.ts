import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import {
  convexClient,
  currentAdmin,
  serverSecret,
} from "../../../../lib/adminSession";
import { badRequest } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return badRequest("Unauthorized", 401);
  const secret = serverSecret();
  const convex = convexClient();
  if (!secret || !convex) return badRequest("Admin is not configured.", 503);
  const days = await convex.query(api.stats.list, {
    secret,
    source: "main-node",
    days: 90,
  });
  const appStore = await convex.query(api.stats.list, {
    secret,
    source: "app-store",
    days: 400,
  });
  const slim = (rows: typeof days) =>
    rows.map((row) => ({ date: row.date, at: row.at, metrics: row.metrics }));
  return NextResponse.json(
    { now: Date.now(), days: slim(days), appStore: slim(appStore) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
