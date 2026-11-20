import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import {
  convexClient,
  newToken,
  normalizeClaimCode,
  serverSecret,
  sha256,
} from "../../../../lib/adminSession";
import { badRequest, createRateLimiter, field } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

const isRateLimited = createRateLimiter();

/**
 * A new node trades its one-time claim code for its license key.
 *   POST { "claimCode": "ABCD-EFGH-JKMN" }
 *   -> { nodeId, nodeKey, name, town, inputType }
 * The key is returned once; the node stores it and sends it on every check-in.
 */
export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return badRequest("Too many attempts. Please try again in a minute.", 429);
    }
    const secret = serverSecret();
    const convex = convexClient();
    if (!secret || !convex) return badRequest("Not configured.", 503);

    const body: unknown = await request.json();
    const claimCode = normalizeClaimCode(field(body, "claimCode"));
    if (!claimCode) return badRequest("That claim code is not valid.");

    const nodeKey = `tnk_${newToken()}`;
    const node = await convex.mutation(api.nodes.enroll, {
      secret,
      claimCodeHash: sha256(claimCode),
      keyHash: sha256(nodeKey),
    });
    if (!node) {
      return badRequest(
        "That claim code is not valid, has expired or was already used.",
        404,
      );
    }
    return NextResponse.json({ ...node, nodeKey });
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}
