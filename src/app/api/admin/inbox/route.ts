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
  try {
    const inbox = await convex.query(api.inbox.overview, { secret });
    return NextResponse.json(
      { ...inbox, now: Date.now() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return badRequest("Failed to load the inbox.", 500);
  }
}
