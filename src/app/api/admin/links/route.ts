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
  const links = await convex.query(api.projectLog.listLinks, { secret });
  return NextResponse.json(
    { links, isOwner: admin.role === "owner" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Only the owner changes the list; everyone invited can read it. */
export async function POST(request: Request) {
  try {
    const admin = await currentAdmin();
    if (!admin) return badRequest("Unauthorized", 401);
    if (admin.role !== "owner") return badRequest("Owner only.", 403);
    const secret = serverSecret();
    const convex = convexClient();
    if (!secret || !convex) return badRequest("Admin is not configured.", 503);

    const body: unknown = await request.json();
    const action = field(body, "action");

    if (action === "add") {
      const label = field(body, "label");
      const url = field(body, "url");
      if (!label || !/^https?:\/\/\S+$/.test(url)) {
        return badRequest("Give the link a name and a full web address.");
      }
      const note = field(body, "note");
      const added = await convex.mutation(api.projectLog.addLinks, {
        secret,
        links: [
          {
            group: field(body, "group") || "Other",
            label: label.slice(0, 80),
            url: url.slice(0, 500),
            ...(note ? { note: note.slice(0, 300) } : {}),
            order: Date.now(),
          },
        ],
      });
      if (added !== 1) return badRequest("Could not save the link.");
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const id = field(body, "id");
      if (!id) return badRequest("Missing link.");
      await convex.mutation(api.projectLog.removeLink, {
        secret,
        id: id as Id<"adminLinks">,
      });
      return NextResponse.json({ success: true });
    }

    return badRequest("Unknown action.");
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}
