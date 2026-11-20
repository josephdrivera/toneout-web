import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  INVITE_TTL_MS,
  convexClient,
  currentAdmin,
  newToken,
  serverSecret,
  sha256,
} from "../../../../lib/adminSession";
import { EMAIL_RE, badRequest, field } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

/** People with access. Only the owner can see or change this list. */
export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return badRequest("Unauthorized", 401);
  if (admin.role !== "owner") return badRequest("Owner only.", 403);
  const secret = serverSecret();
  const convex = convexClient();
  if (!secret || !convex) return badRequest("Admin is not configured.", 503);
  const users = await convex.query(api.admins.list, { secret });
  return NextResponse.json(
    { users, now: Date.now(), me: admin._id },
    { headers: { "Cache-Control": "no-store" } },
  );
}

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

    if (action === "invite") {
      const email = field(body, "email").toLowerCase();
      const name = field(body, "name");
      if (!name || !EMAIL_RE.test(email)) {
        return badRequest("Enter a name and a valid email.");
      }
      const token = newToken();
      const id = await convex.mutation(api.admins.invite, {
        secret,
        email,
        name,
        inviteTokenHash: sha256(token),
        inviteExpiresAt: Date.now() + INVITE_TTL_MS,
      });
      if (!id) return badRequest("That person cannot be invited.");
      // The link is returned once and never stored; the owner sends it on.
      const origin = new URL(request.url).origin;
      return NextResponse.json({
        success: true,
        inviteUrl: `${origin}/admin/invite?token=${token}`,
      });
    }

    if (action === "disable" || action === "enable") {
      const id = field(body, "id");
      if (!id) return badRequest("Missing person.");
      const ok = await convex.mutation(api.admins.setDisabled, {
        secret,
        id: id as Id<"adminUsers">,
        disabled: action === "disable",
      });
      if (!ok) return badRequest("That account cannot be changed.");
      return NextResponse.json({ success: true });
    }

    return badRequest("Unknown action.");
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}
