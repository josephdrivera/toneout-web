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

const HUB_STREAMS_URL =
  process.env.HUB_STREAMS_URL ?? "https://hub.toneout.app/api/streams";

type HubStream = {
  id: string;
  name: string;
  url: string;
  listeners: number;
  started?: string;
  node_id?: string | null;
};

/**
 * What each node is streaming through the hub right now. Best effort: if the
 * hub does not answer quickly, the page simply shows no stream information.
 */
async function hubStreams(): Promise<HubStream[] | null> {
  try {
    const response = await fetch(HUB_STREAMS_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) return null;
    const streams = (data as { streams?: unknown }).streams;
    return Array.isArray(streams) ? (streams as HubStream[]) : null;
  } catch {
    return null;
  }
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,47}$/;
const DEPARTMENT_RE = /^[a-z0-9][a-z0-9_-]{1,63}$/;

type CaptureInput = {
  name: string;
  mount: string;
  inputType: "alsa" | "rtl_fm" | "file";
  device?: string;
  frequencyMhz?: number;
  gain?: number;
  path?: string;
  squelchOpen?: number;
  squelchClose?: number;
  record?: boolean;
  tones: Array<{
    department: string;
    label: string;
    toneA: number;
    toneB: number;
  }>;
};

function finite(value: unknown): number | undefined {
  const n = typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

/** Validates audio settings from the admin form. Returns an error string. */
function parseCapture(raw: unknown): CaptureInput | string {
  if (typeof raw !== "object" || raw === null) return "Missing audio settings.";
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim().slice(0, 80) : "";
  const mount = typeof r.mount === "string" ? r.mount.trim().toLowerCase() : "";
  if (!name) return "Give the channel a name.";
  if (!SLUG_RE.test(mount)) {
    return "The stream name must be 3 to 48 lowercase letters, numbers or dashes.";
  }
  const inputType = r.inputType;
  if (inputType !== "alsa" && inputType !== "rtl_fm" && inputType !== "file") {
    return "Choose where the audio comes from.";
  }
  const out: CaptureInput = { name, mount, inputType, tones: [] };

  if (inputType === "alsa") {
    const device = typeof r.device === "string" ? r.device.trim() : "";
    if (!/^[A-Za-z0-9:,_=.-]{1,60}$/.test(device || "default")) {
      return "That sound card name does not look right.";
    }
    out.device = device || "default";
  } else if (inputType === "rtl_fm") {
    const frequency = finite(r.frequencyMhz);
    if (frequency === undefined || frequency < 24 || frequency > 1766) {
      return "Enter the frequency in MHz, for example 453.075.";
    }
    out.frequencyMhz = frequency;
    const gain = finite(r.gain);
    if (gain !== undefined) {
      if (gain < 0 || gain > 50) return "Gain must be between 0 and 50.";
      out.gain = gain;
    }
  } else {
    const path = typeof r.path === "string" ? r.path.trim() : "";
    if (!/^\/[A-Za-z0-9._\/-]{1,200}$/.test(path) || path.includes("..")) {
      return "Enter the full path of the recording on the node.";
    }
    out.path = path;
  }

  const open = finite(r.squelchOpen);
  const close = finite(r.squelchClose);
  if (open !== undefined) {
    if (open < 1 || open > 32767) return "Squelch levels run from 1 to 32767.";
    out.squelchOpen = open;
  }
  if (close !== undefined) {
    if (close < 1 || close > 32767) return "Squelch levels run from 1 to 32767.";
    out.squelchClose = close;
  }
  if (open !== undefined && close !== undefined && close > open) {
    return "The close level must not be higher than the open level.";
  }
  if (r.record === true) out.record = true;

  const tones = Array.isArray(r.tones) ? r.tones : [];
  if (tones.length > 40) return "That is too many tone pairs.";
  for (const item of tones) {
    if (typeof item !== "object" || item === null) return "A tone row is not valid.";
    const t = item as Record<string, unknown>;
    const department =
      typeof t.department === "string" ? t.department.trim().toLowerCase() : "";
    const label = typeof t.label === "string" ? t.label.trim().slice(0, 80) : "";
    const toneA = finite(t.toneA);
    const toneB = finite(t.toneB);
    if (!label) return "Each tone pair needs a name, such as Company 1.";
    if (!DEPARTMENT_RE.test(department)) {
      return `"${label}" needs an id of lowercase letters, numbers or dashes.`;
    }
    if (
      toneA === undefined ||
      toneB === undefined ||
      toneA < 200 ||
      toneA > 4000 ||
      toneB < 200 ||
      toneB > 4000
    ) {
      return `"${label}" needs two tones between 200 and 4000 Hz.`;
    }
    out.tones.push({ department, label, toneA, toneB });
  }
  return out;
}

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return badRequest("Unauthorized", 401);
  const secret = serverSecret();
  const convex = convexClient();
  if (!secret || !convex) return badRequest("Admin is not configured.", 503);
  try {
    const [overview, streams] = await Promise.all([
      convex.query(api.nodes.adminOverview, { secret }),
      hubStreams(),
    ]);
    const nodes = overview.nodes.map((node) => ({
      ...node,
      streams: (streams ?? [])
        .filter((stream) => stream.node_id === node._id)
        .map((stream) => ({
          id: String(stream.id),
          name: String(stream.name ?? stream.id),
          url: String(stream.url ?? ""),
          listeners: Number(stream.listeners) || 0,
        })),
    }));
    return NextResponse.json(
      {
        ...overview,
        nodes,
        hubReachable: streams !== null,
        now: Date.now(),
        me: { name: admin.name, role: admin.role },
      },
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

    if (action === "configure") {
      const raw =
        typeof body === "object" && body !== null
          ? (body as Record<string, unknown>).capture
          : undefined;
      if (raw === null) {
        const ok = await convex.mutation(api.nodes.setCapture, {
          secret,
          nodeId,
          capture: null,
          actor,
        });
        if (!ok) return badRequest("Node not found.", 404);
        return NextResponse.json({ success: true });
      }
      const parsed = parseCapture(raw);
      if (typeof parsed === "string") return badRequest(parsed);
      const ok = await convex.mutation(api.nodes.setCapture, {
        secret,
        nodeId,
        capture: parsed,
        actor,
      });
      if (!ok) return badRequest("Node not found.", 404);
      return NextResponse.json({ success: true });
    }

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
