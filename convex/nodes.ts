import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertEditorSecret } from "./lib/editorAuth";

/**
 * Node fleet: licensing (claim code -> node key), health check-ins and the
 * admin view. All calls come from Next.js API routes holding the server
 * secret. Claim codes and node keys are hashed in Next; only hashes land here.
 */

const inputTypeValidator = v.union(v.literal("sdr"), v.literal("line-in"));

const healthValidator = v.object({
  version: v.optional(v.string()),
  uptimeSeconds: v.optional(v.number()),
  cpuTempC: v.optional(v.number()),
  audioLevel: v.optional(v.number()),
  lastToneAt: v.optional(v.number()),
  wifiSignal: v.optional(v.number()),
  network: v.optional(v.string()),
  channels: v.optional(v.number()),
  message: v.optional(v.string()),
});

const captureValidator = v.object({
  name: v.string(),
  mount: v.string(),
  inputType: v.union(v.literal("alsa"), v.literal("rtl_fm"), v.literal("file")),
  device: v.optional(v.string()),
  frequencyMhz: v.optional(v.number()),
  gain: v.optional(v.number()),
  path: v.optional(v.string()),
  squelchOpen: v.optional(v.number()),
  squelchClose: v.optional(v.number()),
  record: v.optional(v.boolean()),
  tones: v.array(
    v.object({
      department: v.string(),
      label: v.string(),
      toneA: v.number(),
      toneB: v.number(),
    }),
  ),
});

const MAX_EVENTS_PER_NODE = 20;

const SERIAL_PREFIX = { "line-in": "AO", sdr: "SD" } as const;

/** Highest number already used for each serial prefix. */
function serialCounters(nodes: Array<{ serial?: string }>) {
  const highest: Record<string, number> = {};
  for (const node of nodes) {
    const match = /^([A-Z]{2})-(\d+)$/.exec(node.serial ?? "");
    if (!match) continue;
    highest[match[1]] = Math.max(highest[match[1]] ?? 0, Number(match[2]));
  }
  return highest;
}

function formatSerial(prefix: string, number: number) {
  return `${prefix}-${String(number).padStart(4, "0")}`;
}

export const adminOverview = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const nodes = await ctx.db.query("nodes").order("desc").take(200);
    const requests = await ctx.db
      .query("demoRequests")
      .withIndex("by_submittedAt")
      .order("desc")
      .take(50);

    // No clock reads here: query results are cached, so "now" is added by
    // the Next.js route and expiry is judged by the caller.
    const nodeRows = [];
    for (const node of nodes) {
      const events = await ctx.db
        .query("nodeEvents")
        .withIndex("by_nodeId_at", (q) => q.eq("nodeId", node._id))
        .order("desc")
        .take(5);
      nodeRows.push({
        _id: node._id,
        name: node.name,
        serial: node.serial,
        hostLabel: node.hostLabel,
        town: node.town,
        hostName: node.hostName,
        inputType: node.inputType,
        status: node.status,
        notes: node.notes,
        requestId: node.requestId,
        createdAt: node.createdAt,
        enrolledAt: node.enrolledAt,
        lastSeenAt: node.lastSeenAt,
        health: node.health,
        capture: node.capture,
        configVersion: node.configVersion ?? 0,
        hasClaim: Boolean(node.claimCodeHash),
        claimExpiresAt: node.claimExpiresAt,
        events: events.map((event) => ({
          at: event.at,
          type: event.type,
          detail: event.detail,
        })),
      });
    }

    const requestRows = [];
    for (const request of requests) {
      const linked = await ctx.db
        .query("nodes")
        .withIndex("by_requestId", (q) => q.eq("requestId", request._id))
        .take(1);
      requestRows.push({
        _id: request._id,
        hostType: request.hostType,
        name: request.name,
        department: request.department,
        town: request.town,
        email: request.email,
        phone: request.phone,
        role: request.role,
        message: request.message,
        submittedAt: request.submittedAt,
        hasNode: linked.length > 0,
      });
    }

    return { nodes: nodeRows, requests: requestRows };
  },
});

export const create = mutation({
  args: {
    secret: v.string(),
    name: v.string(),
    town: v.string(),
    hostName: v.optional(v.string()),
    inputType: inputTypeValidator,
    notes: v.optional(v.string()),
    requestId: v.optional(v.id("demoRequests")),
    claimCodeHash: v.string(),
    claimExpiresAt: v.number(),
    actor: v.string(),
  },
  returns: v.union(v.id("nodes"), v.null()),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const name = args.name.trim();
    const town = args.town.trim();
    if (!name || !town) return null;
    const hostName = args.hostName?.trim();
    const notes = args.notes?.trim();
    // Serials are never reused: the next number after the highest ever given.
    const prefix = SERIAL_PREFIX[args.inputType];
    const existing = await ctx.db.query("nodes").take(1000);
    const serial = formatSerial(
      prefix,
      (serialCounters(existing)[prefix] ?? 0) + 1,
    );
    const nodeId = await ctx.db.insert("nodes", {
      name,
      serial,
      town,
      ...(hostName ? { hostName } : {}),
      inputType: args.inputType,
      status: "pending",
      claimCodeHash: args.claimCodeHash,
      claimExpiresAt: args.claimExpiresAt,
      ...(args.requestId ? { requestId: args.requestId } : {}),
      ...(notes ? { notes } : {}),
      createdAt: Date.now(),
    });
    await ctx.db.insert("nodeEvents", {
      nodeId,
      at: Date.now(),
      type: "created",
      detail: `by ${args.actor}`,
    });
    return nodeId;
  },
});

/** Issues a fresh claim code, e.g. after re-flashing a node's card. */
export const reissueClaim = mutation({
  args: {
    secret: v.string(),
    nodeId: v.id("nodes"),
    claimCodeHash: v.string(),
    claimExpiresAt: v.number(),
    actor: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const node = await ctx.db.get(args.nodeId);
    if (!node) return false;
    // The old key stops working at once: a re-claimed node gets a new one.
    await ctx.db.patch(args.nodeId, {
      claimCodeHash: args.claimCodeHash,
      claimExpiresAt: args.claimExpiresAt,
      keyHash: undefined,
      status: "pending",
    });
    await ctx.db.insert("nodeEvents", {
      nodeId: args.nodeId,
      at: Date.now(),
      type: "claim-reissued",
      detail: `by ${args.actor}`,
    });
    return true;
  },
});

export const setStatus = mutation({
  args: {
    secret: v.string(),
    nodeId: v.id("nodes"),
    disabled: v.boolean(),
    actor: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const node = await ctx.db.get(args.nodeId);
    if (!node) return false;
    const status = args.disabled
      ? ("disabled" as const)
      : node.keyHash
        ? ("active" as const)
        : ("pending" as const);
    await ctx.db.patch(args.nodeId, { status });
    await ctx.db.insert("nodeEvents", {
      nodeId: args.nodeId,
      at: Date.now(),
      type: args.disabled ? "disabled" : "enabled",
      detail: `by ${args.actor}`,
    });
    return true;
  },
});

/** Only a node that never enrolled can be deleted; others are disabled. */
export const remove = mutation({
  args: { secret: v.string(), nodeId: v.id("nodes") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const node = await ctx.db.get(args.nodeId);
    if (!node || node.enrolledAt) return false;
    const events = await ctx.db
      .query("nodeEvents")
      .withIndex("by_nodeId_at", (q) => q.eq("nodeId", args.nodeId))
      .take(100);
    for (const event of events) await ctx.db.delete(event._id);
    await ctx.db.delete(args.nodeId);
    return true;
  },
});

/** A node trades its one-time claim code for its license key. */
export const enroll = mutation({
  args: {
    secret: v.string(),
    claimCodeHash: v.string(),
    keyHash: v.string(),
  },
  returns: v.union(
    v.object({
      nodeId: v.id("nodes"),
      name: v.string(),
      town: v.string(),
      inputType: inputTypeValidator,
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const node = await ctx.db
      .query("nodes")
      .withIndex("by_claimCodeHash", (q) =>
        q.eq("claimCodeHash", args.claimCodeHash),
      )
      .unique();
    if (!node || node.status === "disabled") return null;
    if ((node.claimExpiresAt ?? 0) < Date.now()) return null;
    await ctx.db.patch(node._id, {
      keyHash: args.keyHash,
      claimCodeHash: undefined,
      claimExpiresAt: undefined,
      status: "active",
      enrolledAt: Date.now(),
    });
    await ctx.db.insert("nodeEvents", {
      nodeId: node._id,
      at: Date.now(),
      type: "enrolled",
    });
    return {
      nodeId: node._id,
      name: node.name,
      town: node.town,
      inputType: node.inputType,
    };
  },
});

/**
 * Health check-in. Returns "unknown" for a bad key and "disabled" for a
 * revoked license so the node can stop streaming.
 */
export const heartbeat = mutation({
  args: {
    secret: v.string(),
    keyHash: v.string(),
    health: healthValidator,
  },
  returns: v.union(
    v.literal("ok"),
    v.literal("disabled"),
    v.literal("unknown"),
  ),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const node = await ctx.db
      .query("nodes")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", args.keyHash))
      .unique();
    if (!node) return "unknown";
    if (node.status === "disabled") return "disabled";

    const now = Date.now();
    const wasOffline =
      !node.lastSeenAt || now - node.lastSeenAt > 5 * 60 * 1000;
    await ctx.db.patch(node._id, { lastSeenAt: now, health: args.health });

    if (wasOffline) {
      await ctx.db.insert("nodeEvents", {
        nodeId: node._id,
        at: now,
        type: "online",
        detail: args.health.network,
      });
      // Keep the per-node log short.
      const events = await ctx.db
        .query("nodeEvents")
        .withIndex("by_nodeId_at", (q) => q.eq("nodeId", node._id))
        .order("desc")
        .take(MAX_EVENTS_PER_NODE + 20);
      for (const event of events.slice(MAX_EVENTS_PER_NODE)) {
        await ctx.db.delete(event._id);
      }
    }
    return "ok";
  },
});

/**
 * Read-only license check, used by the hub before it accepts a node's audio.
 * Does not count as a check-in.
 */
export const verifyKey = query({
  args: { secret: v.string(), keyHash: v.string() },
  returns: v.union(
    v.object({
      nodeId: v.id("nodes"),
      name: v.string(),
      town: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("active"),
        v.literal("disabled"),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const node = await ctx.db
      .query("nodes")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", args.keyHash))
      .unique();
    if (!node) return null;
    return {
      nodeId: node._id,
      name: node.name,
      town: node.town,
      status: node.status,
    };
  },
});

/**
 * Saves (or clears) a node's audio settings and bumps its config version, so
 * the node picks the change up at its next check-in.
 */
export const setCapture = mutation({
  args: {
    secret: v.string(),
    nodeId: v.id("nodes"),
    capture: v.union(captureValidator, v.null()),
    actor: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const node = await ctx.db.get(args.nodeId);
    if (!node) return false;
    await ctx.db.patch(args.nodeId, {
      capture: args.capture ?? undefined,
      configVersion: (node.configVersion ?? 0) + 1,
    });
    await ctx.db.insert("nodeEvents", {
      nodeId: args.nodeId,
      at: Date.now(),
      type: args.capture ? "audio settings saved" : "audio settings cleared",
      detail: `by ${args.actor}`,
    });
    return true;
  },
});

/** A node asks for its current audio settings. */
export const getConfig = query({
  args: { secret: v.string(), keyHash: v.string() },
  returns: v.union(
    v.object({
      status: v.union(
        v.literal("pending"),
        v.literal("active"),
        v.literal("disabled"),
      ),
      version: v.number(),
      capture: v.union(captureValidator, v.null()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const node = await ctx.db
      .query("nodes")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", args.keyHash))
      .unique();
    if (!node) return null;
    return {
      status: node.status,
      version: node.configVersion ?? 0,
      capture: node.capture ?? null,
    };
  },
});

/**
 * Health check-in that also tells the node which settings version is current.
 * (The older `heartbeat` stays so a deploy never breaks running nodes.)
 */
export const checkin = mutation({
  args: {
    secret: v.string(),
    keyHash: v.string(),
    health: healthValidator,
    // The name the host typed on the node's setup page, if any.
    hostLabel: v.optional(v.string()),
  },
  returns: v.object({
    result: v.union(
      v.literal("ok"),
      v.literal("disabled"),
      v.literal("unknown"),
    ),
    configVersion: v.number(),
  }),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const node = await ctx.db
      .query("nodes")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", args.keyHash))
      .unique();
    if (!node) return { result: "unknown" as const, configVersion: 0 };
    if (node.status === "disabled") {
      return { result: "disabled" as const, configVersion: 0 };
    }

    const now = Date.now();
    const wasOffline =
      !node.lastSeenAt || now - node.lastSeenAt > 5 * 60 * 1000;
    await ctx.db.patch(node._id, { lastSeenAt: now, health: args.health });

    // The host renamed the node. Our own name and serial stay as they are.
    const hostLabel = args.hostLabel?.trim().slice(0, 40);
    if (hostLabel && hostLabel !== node.hostLabel) {
      await ctx.db.patch(node._id, { hostLabel });
      await ctx.db.insert("nodeEvents", {
        nodeId: node._id,
        at: now,
        type: "renamed by host",
        detail: hostLabel,
      });
    }

    if (wasOffline) {
      await ctx.db.insert("nodeEvents", {
        nodeId: node._id,
        at: now,
        type: "online",
        detail: args.health.network,
      });
      const events = await ctx.db
        .query("nodeEvents")
        .withIndex("by_nodeId_at", (q) => q.eq("nodeId", node._id))
        .order("desc")
        .take(MAX_EVENTS_PER_NODE + 20);
      for (const event of events.slice(MAX_EVENTS_PER_NODE)) {
        await ctx.db.delete(event._id);
      }
    }
    return { result: "ok" as const, configVersion: node.configVersion ?? 0 };
  },
});

/**
 * One-off: gives a serial to nodes created before serials existed, oldest
 * first. Safe to run again; nodes that have one are left alone.
 */
export const backfillSerials = mutation({
  args: { secret: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const nodes = await ctx.db.query("nodes").take(1000);
    const highest = serialCounters(nodes);
    const missing = nodes
      .filter((node) => !node.serial)
      .sort((a, b) => a.createdAt - b.createdAt);
    for (const node of missing) {
      const prefix = SERIAL_PREFIX[node.inputType];
      highest[prefix] = (highest[prefix] ?? 0) + 1;
      await ctx.db.patch(node._id, {
        serial: formatSerial(prefix, highest[prefix]),
      });
    }
    return missing.length;
  },
});
