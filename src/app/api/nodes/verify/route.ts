import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { convexClient, serverSecret, sha256 } from "../../../../lib/adminSession";
import { badRequest } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

/**
 * License check for the hub: is this node key valid and enabled right now?
 *   Authorization: Bearer <nodeKey>
 *   -> 200 { ok: true, nodeId, name, town }
 *   -> 401 unknown key, 403 license disabled
 * The hub calls this before it accepts a node's audio stream.
 */
export async function POST(request: Request) {
  try {
    const secret = serverSecret();
    const convex = convexClient();
    if (!secret || !convex) return badRequest("Not configured.", 503);

    const auth = request.headers.get("authorization") ?? "";
    const nodeKey = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!nodeKey) return badRequest("Missing node key.", 401);

    const node = await convex.query(api.nodes.verifyKey, {
      secret,
      keyHash: sha256(nodeKey),
    });
    if (!node) return badRequest("Unknown node key.", 401);
    if (node.status !== "active") {
      return badRequest("This node's license is disabled.", 403);
    }
    return NextResponse.json(
      { ok: true, nodeId: node.nodeId, name: node.name, town: node.town },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}
