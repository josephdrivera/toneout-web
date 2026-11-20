import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  CLAIM_TTL_MS,
  convexClient,
  currentAdmin,
  newClaimCode,
  serverSecret,
  sha256,
} from "../../../../lib/adminSession";
import { badRequest, field } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return badRequest("Unauthorized", 401);
  const secret = serverSecret();
  const convex = convexClient();
  if (!secret || !convex) return badRequest("Admin is not configured.", 503);
  try {
    const overview = await convex.query(api.nodes.adminOverview, { secret });
    return NextResponse.json(
      { ...overview, now: Date.now(), me: { name: admin.name, role: admin.role } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return badRequest("Failed to load nodes.", 500);
  }
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
    const actor = admin.name;

    if (action === "create") {
      const name = field(body, "name");
      const town = field(body, "town");
      const inputType = field(body, "inputType");
      if (!name || !town) return badRequest("Give the node a name and a town.");
      if (inputType !== "sdr" && inputType !== "line-in") {
        return badRequest("Choose how the node gets its audio.");
      }
      const hostName = field(body, "hostName");
      const notes = field(body, "notes");
      const requestId = field(body, "requestId");
      const claimCode = newClaimCode();
      const nodeId = await convex.mutation(api.nodes.create, {
        secret,
        name,
        town,
        inputType,
        ...(hostName ? { hostName } : {}),
        ...(notes ? { notes } : {}),
        ...(requestId ? { requestId: requestId as Id<"demoRequests"> } : {}),
        claimCodeHash: sha256(claimCode),
        claimExpiresAt: Date.now() + CLAIM_TTL_MS,
        actor,
      });
      if (!nodeId) return badRequest("Could not create the node.");
      // Shown once: only its hash is stored.
      return NextResponse.json({ success: true, nodeId, claimCode });
    }

    const nodeId = field(body, "nodeId") as Id<"nodes">;
    if (!nodeId) return badRequest("Missing node.");

    if (action === "reissue") {
      const claimCode = newClaimCode();
      const ok = await convex.mutation(api.nodes.reissueClaim, {
        secret,
        nodeId,
        claimCodeHash: sha256(claimCode),
        claimExpiresAt: Date.now() + CLAIM_TTL_MS,
        actor,
      });
      if (!ok) return badRequest("Node not found.", 404);
      return NextResponse.json({ success: true, nodeId, claimCode });
    }

    if (action === "disable" || action === "enable") {
      const ok = await convex.mutation(api.nodes.setStatus, {
        secret,
        nodeId,
        disabled: action === "disable",
        actor,
      });
      if (!ok) return badRequest("Node not found.", 404);
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const ok = await convex.mutation(api.nodes.remove, { secret, nodeId });
      if (!ok) {
        return badRequest(
          "Only a node that never connected can be deleted. Disable it instead.",
        );
      }
      return NextResponse.json({ success: true });
    }

    return badRequest("Unknown action.");
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}
