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
  return NextResponse.json(
    {
      now: Date.now(),
      days: days.map((row) => ({
        date: row.date,
        at: row.at,
        metrics: row.metrics,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
