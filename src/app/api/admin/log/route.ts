import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  convexClient,
  currentAdmin,
  serverSecret,
} from "../../../../lib/adminSession";
import { badRequest, field } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return badRequest("Unauthorized", 401);
  const secret = serverSecret();
  const convex = convexClient();
  if (!secret || !convex) return badRequest("Admin is not configured.", 503);
  const entries = await convex.query(api.projectLog.listEntries, { secret });
  return NextResponse.json(
    { entries, isOwner: admin.role === "owner" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  try {
    const admin = await currentAdmin();
    if (!admin) return badRequest("Unauthorized", 401);
    const secret = serverSecret();
    const convex = convexClient();
    if (!secret || !convex) return badRequest("Admin is not configured.", 503);

    const body: unknown = await request.json();
    const action = field(body, "action");

    if (action === "add") {
      const date = field(body, "date");
      const title = field(body, "title");
      const text = field(body, "body");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !title || !text) {
        return badRequest("Give the entry a date, a title and some detail.");
      }
      const added = await convex.mutation(api.projectLog.addEntries, {
        secret,
        entries: [
          {
            date,
            area: field(body, "area") || "General",
            title: title.slice(0, 160),
            body: text.slice(0, 6000),
            author: admin.name,
          },
        ],
      });
      if (added !== 1) return badRequest("Could not save the entry.");
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      if (admin.role !== "owner") return badRequest("Owner only.", 403);
      const id = field(body, "id");
      if (!id) return badRequest("Missing entry.");
      await convex.mutation(api.projectLog.removeEntry, {
        secret,
        id: id as Id<"projectLog">,
      });
      return NextResponse.json({ success: true });
    }

    return badRequest("Unknown action.");
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}
