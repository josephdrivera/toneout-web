import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { convexClient, serverSecret, sha256 } from "../../../../lib/adminSession";
import { badRequest } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function str(value: unknown, max: number): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : undefined;
}

/**
 * Node health check-in, sent about once a minute.
 *   Authorization: Bearer <nodeKey>
 *   POST { version, uptimeSeconds, cpuTempC, audioLevel, lastToneAt,
 *          wifiSignal, network, channels, message }   (all optional)
 *   -> 200 { ok: true }
 *   -> 401 unknown key, 403 license disabled (the node should stop streaming)
 */
export async function POST(request: Request) {
  try {
    const secret = serverSecret();
    const convex = convexClient();
    if (!secret || !convex) return badRequest("Not configured.", 503);

    const auth = request.headers.get("authorization") ?? "";
    const nodeKey = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!nodeKey) return badRequest("Missing node key.", 401);

    const body: unknown = await request.json().catch(() => ({}));
    const raw = (typeof body === "object" && body !== null ? body : {}) as Record<
      string,
      unknown
    >;
    const health = {
      version: str(raw.version, 40),
      uptimeSeconds: num(raw.uptimeSeconds),
      cpuTempC: num(raw.cpuTempC),
      audioLevel: num(raw.audioLevel),
      lastToneAt: num(raw.lastToneAt),
      wifiSignal: num(raw.wifiSignal),
      network: str(raw.network, 60),
      channels: num(raw.channels),
      message: str(raw.message, 200),
    };
    // Convex rejects explicit undefined in objects sent over HTTP.
    const clean = Object.fromEntries(
      Object.entries(health).filter(([, value]) => value !== undefined),
    );

    const result = await convex.mutation(api.nodes.heartbeat, {
      secret,
      keyHash: sha256(nodeKey),
      health: clean,
    });
    if (result === "unknown") return badRequest("Unknown node key.", 401);
    if (result === "disabled") {
      return badRequest("This node's license is disabled.", 403);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}
