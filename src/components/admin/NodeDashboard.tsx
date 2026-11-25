"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AudioSettings, { type CaptureSettings } from "./AudioSettings";
import NetworkLine, { type Station } from "./NetworkLine";

type Health = {
  version?: string;
  uptimeSeconds?: number;
  cpuTempC?: number;
  audioLevel?: number;
  lastToneAt?: number;
  wifiSignal?: number;
  network?: string;
  channels?: number;
  message?: string;
};

type NodeRow = {
  _id: string;
  name: string;
  serial?: string;
  hostLabel?: string;
  town: string;
  hostName?: string;
  inputType: "sdr" | "line-in";
  status: "pending" | "active" | "disabled";
  notes?: string;
  createdAt: number;
  enrolledAt?: number;
  lastSeenAt?: number;
  health?: Health;
  hasClaim: boolean;
  claimExpiresAt?: number;
  events: Array<{ at: number; type: string; detail?: string }>;
  streams?: Array<{ id: string; name: string; url: string; listeners: number }>;
  capture?: CaptureSettings;
  configVersion?: number;
};

type RequestRow = {
  _id: string;
  hostType?: "firehouse" | "home";
  name: string;
  department?: string;
  town: string;
  email: string;
  phone?: string;
  role?: string;
  message?: string;
  submittedAt: number;
  hasNode: boolean;
};

type Overview = { now: number; nodes: NodeRow[]; requests: RequestRow[] };

type NewNode = {
  name: string;
  town: string;
  hostName: string;
  inputType: "sdr" | "line-in";
  notes: string;
  requestId: string;
};

const EMPTY_NODE: NewNode = {
  name: "",
  town: "",
  hostName: "",
  inputType: "sdr",
  notes: "",
  requestId: "",
};

/** A node checks in about once a minute; three misses means offline. */
const ONLINE_WINDOW_MS = 3 * 60 * 1000;
const REFRESH_MS = 20_000;

const inputClass =
  "w-full rounded-md border border-borderLight bg-background px-3 py-2.5 text-base text-textPrimary placeholder:text-textHint focus:border-borderBright focus:outline-none sm:text-sm";
const smallButton =
  "rounded-md border border-borderBright px-3 py-1.5 text-xs font-semibold text-textBody transition-colors hover:text-textPrimary disabled:opacity-50";

function ago(timestamp: number | undefined, now: number): string {
  if (!timestamp) return "never";
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

function uptime(seconds: number | undefined): string | null {
  if (seconds === undefined) return null;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 48) return `${Math.floor(hours / 24)} days`;
  if (hours >= 1) return `${hours} hr`;
  return `${Math.max(1, Math.floor(seconds / 60))} min`;
}

type State = "online" | "offline" | "waiting" | "disabled";

function nodeState(node: NodeRow, now: number): State {
  if (node.status === "disabled") return "disabled";
  if (node.status === "pending") return "waiting";
  return node.lastSeenAt && now - node.lastSeenAt < ONLINE_WINDOW_MS
    ? "online"
    : "offline";
}

const STATE_STYLE: Record<State, { label: string; dot: string; text: string }> =
  {
    online: { label: "Online", dot: "bg-ems", text: "text-ems" },
    offline: { label: "Offline", dot: "bg-fire", text: "text-fire" },
    waiting: { label: "Waiting for setup", dot: "bg-gold", text: "text-gold" },
    disabled: {
      label: "Disabled",
      dot: "bg-textMuted",
      text: "text-textBody",
    },
  };

export default function NodeDashboard() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [claim, setClaim] = useState<{ name: string; code: string } | null>(
    null,
  );
  const [form, setForm] = useState<NewNode | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [editingAudio, setEditingAudio] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/nodes", { cache: "no-store" });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        setError("Could not load the nodes. Retrying.");
        return;
      }
      setOverview((await response.json()) as Overview);
      setError(null);
    } catch {
      setError("Could not load the nodes. Retrying.");
    }
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    const timer = setInterval(() => void refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  async function act(body: Record<string, string>) {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        claimCode?: string;
      } | null;
      if (!response.ok) {
        setNotice(data?.error ?? "That did not work.");
        return null;
      }
      await refresh();
      return data;
    } catch {
      setNotice("That did not work. Check your connection.");
      return null;
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  async function createNode(event: FormEvent) {
    event.preventDefault();
    if (!form || busy) return;
    const data = await act({ action: "create", ...form });
    if (data?.claimCode) {
      setClaim({ name: form.name, code: data.claimCode });
      setForm(null);
    }
  }

  async function reissue(node: NodeRow) {
    const data = await act({ action: "reissue", nodeId: node._id });
    if (data?.claimCode) setClaim({ name: node.name, code: data.claimCode });
  }

  if (overview === null) {
    return (
      <p className="text-sm text-textBody">{error ?? "Loading the nodes…"}</p>
    );
  }

  const { now, nodes, requests } = overview;
  const counts = { online: 0, offline: 0, waiting: 0, disabled: 0 };
  for (const node of nodes) counts[nodeState(node, now)] += 1;
  const openRequests = requests.filter((request) => !request.hasNode);

  return (
    <div className="space-y-10">
      {error && (
        <p className="rounded-lg border border-fire/30 bg-fire/5 px-4 py-3 text-xs text-fire">
          {error}
        </p>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            ["Online", counts.online, "text-ems"],
            ["Offline", counts.offline, "text-fire"],
            ["Waiting", counts.waiting, "text-gold"],
          ] as const
        ).map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-surface px-4 py-3"
          >
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-textBody">
              {label}
            </p>
          </div>
        ))}
      </div>

      <NetworkLine
        now={now}
        stations={nodes
          .filter((node) => node.status !== "disabled")
          .map((node): Station => {
            const state = nodeState(node, now);
            return {
              id: node._id,
              name: node.name,
              town: node.town,
              state: state === "disabled" ? "offline" : state,
              lastSeenAt: node.lastSeenAt,
              detail:
                state === "offline"
                  ? `Last seen ${ago(node.lastSeenAt, now)}`
                  : state === "waiting"
                    ? "Waiting for setup"
                    : node.health?.channels
                      ? `${node.health.channels} channels`
                      : undefined,
            };
          })}
      />

      {/* One-time claim code */}
      {claim && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            Claim code for {claim.name}
          </p>
          <p className="my-2 select-all break-all font-mono text-2xl font-bold tracking-wider text-textPrimary">
            {claim.code}
          </p>
          <p className="text-xs leading-relaxed text-textBody">
            Enter this on the node during setup. It works once, expires in 14
            days and will not be shown again.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className={smallButton}
              onClick={() => void navigator.clipboard?.writeText(claim.code)}
            >
              Copy
            </button>
            <button
              type="button"
              className={smallButton}
              onClick={() => setClaim(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {notice && (
        <p className="rounded-lg border border-borderBright bg-surface px-4 py-3 text-xs text-textSecondary">
          {notice}
        </p>
      )}

      {/* Nodes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-textPrimary">
            Nodes ({nodes.length})
          </h2>
          {!form && (
            <button
              type="button"
              onClick={() => setForm(EMPTY_NODE)}
              className="rounded-md bg-fire/90 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-fire"
            >
              Add node
            </button>
          )}
        </div>

        {form && (
          <form
            onSubmit={createNode}
            className="mb-4 space-y-3 rounded-xl border border-borderBright bg-surface px-5 py-4"
          >
            <p className="text-xs font-semibold text-textPrimary">New node</p>
            <input
              className={inputClass}
              placeholder="Node name, e.g. Node 02"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Town"
              value={form.town}
              onChange={(event) => setForm({ ...form, town: event.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Host (person or firehouse), optional"
              value={form.hostName}
              onChange={(event) =>
                setForm({ ...form, hostName: event.target.value })
              }
            />
            <select
              className={inputClass}
              value={form.inputType}
              onChange={(event) =>
                setForm({
                  ...form,
                  inputType: event.target.value as "sdr" | "line-in",
                })
              }
            >
              <option value="sdr">Radio dongle (SDR)</option>
              <option value="line-in">Scanner audio jack (line-in)</option>
            </select>
            <input
              className={inputClass}
              placeholder="Notes, optional"
              value={form.notes}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy || !form.name.trim() || !form.town.trim()}
                className="rounded-md bg-fire/90 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-fire disabled:opacity-50"
              >
                Create and get claim code
              </button>
              <button
                type="button"
                className={smallButton}
                onClick={() => setForm(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {nodes.length === 0 && !form && (
          <p className="rounded-xl border border-border bg-surface px-5 py-6 text-sm text-textBody">
            No nodes yet. Add one to get a claim code for its setup.
          </p>
        )}

        <div className="space-y-3">
          {nodes.map((node) => {
            const state = nodeState(node, now);
            const style = STATE_STYLE[state];
            const health = node.health ?? {};
            const facts: Array<[string, string]> = [];
            if (node.status !== "pending") {
              facts.push(["Last check-in", ago(node.lastSeenAt, now)]);
            }
            if (health.lastToneAt) {
              facts.push(["Last tone", ago(health.lastToneAt, now)]);
            }
            if (health.audioLevel !== undefined) {
              facts.push(["Audio level", `${Math.round(health.audioLevel)}`]);
            }
            if (health.network) facts.push(["Network", health.network]);
            if (health.wifiSignal !== undefined) {
              facts.push(["Wi-Fi signal", `${health.wifiSignal} dBm`]);
            }
            if (health.cpuTempC !== undefined) {
              facts.push(["Temperature", `${Math.round(health.cpuTempC)}°C`]);
            }
            const up = uptime(health.uptimeSeconds);
            if (up) facts.push(["Uptime", up]);
            if (health.channels !== undefined) {
              facts.push(["Channels", `${health.channels}`]);
            }
            if (health.version) facts.push(["Software", health.version]);

            return (
              <article
                key={node._id}
                className="rounded-xl border border-border bg-surface px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-textPrimary">
                      {node.name}
                      {node.serial ? (
                        <span className="ml-2 font-mono text-xs font-semibold text-textMuted">
                          {node.serial}
                        </span>
                      ) : null}
                    </h3>
                    {node.hostLabel ? (
                      <p className="truncate text-xs text-textBody">
                        Host calls it{" "}
                        <span className="font-semibold text-textPrimary">
                          {node.hostLabel}
                        </span>
                      </p>
                    ) : null}
                    <p className="text-xs text-textBody">
                      {node.town}
                      {node.hostName ? ` · ${node.hostName}` : ""} ·{" "}
                      {node.inputType === "sdr" ? "SDR" : "Line-in"}
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1.5 text-xs font-bold ${style.text}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {style.label}
                  </span>
                </div>

                {node.status === "pending" && (
                  <p className="mt-3 text-xs text-textBody">
                    {node.hasClaim && (node.claimExpiresAt ?? 0) > now
                      ? `Claim code issued, not used yet. Expires ${new Date(
                          node.claimExpiresAt ?? 0,
                        ).toLocaleDateString()}.`
                      : "Claim code expired. Issue a new one."}
                  </p>
                )}

                {facts.length > 0 && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                    {facts.map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-textMuted">
                          {label}
                        </dt>
                        <dd className="truncate text-xs text-textSecondary">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {node.capture && (
                  <p className="mt-3 text-xs text-textBody">
                    Audio: {node.capture.name} ·{" "}
                    {node.capture.inputType === "alsa"
                      ? "scanner jack"
                      : node.capture.inputType === "rtl_fm"
                        ? `${node.capture.frequencyMhz} MHz`
                        : "test recording"}{" "}
                    · {node.capture.tones.length} tone pair
                    {node.capture.tones.length === 1 ? "" : "s"}
                  </p>
                )}

                {node.streams && node.streams.length > 0 && (
                  <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-textMuted">
                      Streaming through the hub
                    </p>
                    {node.streams.map((stream) => (
                      <p
                        key={stream.id}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <a
                          href={stream.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 truncate text-textSecondary hover:text-accent"
                        >
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-ems align-middle" />
                          {stream.name} ↗
                        </a>
                        <span className="shrink-0 text-textMuted">
                          {stream.listeners} listening
                        </span>
                      </p>
                    ))}
                  </div>
                )}

                {health.message && (
                  <p className="mt-3 text-xs text-gold">{health.message}</p>
                )}
                {node.notes && (
                  <p className="mt-3 text-xs text-textBody">{node.notes}</p>
                )}

                {node.events.length > 0 && (
                  <p className="mt-3 text-[11px] text-textMuted">
                    {node.events
                      .slice(0, 3)
                      .map((event) => `${event.type} ${ago(event.at, now)}`)
                      .join(" · ")}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {confirming === node._id ? (
                    <>
                      <span className="self-center text-xs text-textSecondary">
                        Disable this node? It stops being accepted at once.
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        className="rounded-md bg-fire/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-fire disabled:opacity-50"
                        onClick={() =>
                          void act({ action: "disable", nodeId: node._id })
                        }
                      >
                        Yes, disable
                      </button>
                      <button
                        type="button"
                        className={smallButton}
                        onClick={() => setConfirming(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {node.status === "disabled" ? (
                        <button
                          type="button"
                          disabled={busy}
                          className={smallButton}
                          onClick={() =>
                            void act({ action: "enable", nodeId: node._id })
                          }
                        >
                          Enable
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          className={smallButton}
                          onClick={() => setConfirming(node._id)}
                        >
                          Disable
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        className={smallButton}
                        onClick={() =>
                          setEditingAudio(
                            editingAudio === node._id ? null : node._id,
                          )
                        }
                      >
                        Audio settings
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className={smallButton}
                        onClick={() => void reissue(node)}
                      >
                        New claim code
                      </button>
                      {!node.enrolledAt && (
                        <button
                          type="button"
                          disabled={busy}
                          className={smallButton}
                          onClick={() =>
                            void act({ action: "delete", nodeId: node._id })
                          }
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>

                {editingAudio === node._id && (
                  <AudioSettings
                    key={`${node._id}-${node.configVersion ?? 0}`}
                    nodeId={node._id}
                    town={node.town}
                    defaultInput={node.inputType === "sdr" ? "rtl_fm" : "alsa"}
                    current={node.capture}
                    onSaved={() => {
                      setEditingAudio(null);
                      setNotice(
                        "Audio settings saved. The node will apply them at its next check-in.",
                      );
                      void refresh();
                    }}
                    onClose={() => setEditingAudio(null)}
                  />
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Host a Node requests */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-textPrimary">
          Host requests ({openRequests.length} open)
        </h2>
        {requests.length === 0 && (
          <p className="rounded-xl border border-border bg-surface px-5 py-6 text-sm text-textBody">
            Nobody has asked to host a node yet.
          </p>
        )}
        <div className="space-y-3">
          {requests.map((request) => (
            <article
              key={request._id}
              className="rounded-xl border border-border bg-surface px-5 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-textPrimary">
                    {request.department ?? request.name}
                  </h3>
                  <p className="text-xs text-textBody">
                    {request.town} ·{" "}
                    {request.hostType === "home" ? "Home" : "Firehouse"} ·{" "}
                    {ago(request.submittedAt, now)}
                  </p>
                </div>
                {request.hasNode ? (
                  <span className="shrink-0 text-xs font-bold text-ems">
                    Node created
                  </span>
                ) : (
                  <button
                    type="button"
                    className={`${smallButton} shrink-0`}
                    onClick={() => {
                      setForm({
                        ...EMPTY_NODE,
                        town: request.town,
                        hostName: request.department ?? request.name,
                        requestId: request._id,
                      });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Create node
                  </button>
                )}
              </div>
              <p className="mt-2 break-words text-xs text-textSecondary">
                {request.name}
                {request.role ? `, ${request.role}` : ""} ·{" "}
                <a className="text-accent hover:underline" href={`mailto:${request.email}`}>
                  {request.email}
                </a>
                {request.phone ? (
                  <>
                    {" · "}
                    <a className="text-accent hover:underline" href={`tel:${request.phone}`}>
                      {request.phone}
                    </a>
                  </>
                ) : null}
              </p>
              {request.message && (
                <p className="mt-2 text-xs leading-relaxed text-textBody">
                  {request.message}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
