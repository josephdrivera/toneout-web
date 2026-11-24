"use client";

import { useEffect, useRef, useState } from "react";

export type Station = {
  id: string;
  name: string;
  town: string;
  state: "online" | "offline" | "waiting";
  lastSeenAt?: number;
  detail?: string;
};

/** Real nodes take over the map once this many are online. */
export const LIVE_MAP_MIN_ONLINE = 3;

const ROW = 76;
const HUB = 84;
const BEAT_MS = 60_000;
const WEB_MIN_WIDTH = 600;

const DEMO: Array<Omit<Station, "lastSeenAt"> & { offset: number }> = [
  {
    id: "d1",
    name: "Main node",
    town: "Glastonbury",
    state: "online",
    detail: "16 channels · SDR",
    offset: 7,
  },
  {
    id: "d2",
    name: "Station 2 rooftop",
    town: "East Hartford",
    state: "online",
    detail: "4 channels · SDR",
    offset: 31,
  },
  {
    id: "d3",
    name: "Firehouse line-in",
    town: "Wethersfield",
    state: "online",
    detail: "1 channel · scanner jack",
    offset: 48,
  },
  {
    id: "d4",
    name: "Volunteer host",
    town: "Rocky Hill",
    state: "online",
    detail: "2 channels · SDR",
    offset: 19,
  },
  {
    id: "d5",
    name: "Solar rooftop",
    town: "Marlborough",
    state: "offline",
    detail: "Last seen 2 hr ago",
    offset: 0,
  },
  {
    id: "d6",
    name: "New kit",
    town: "Portland",
    state: "waiting",
    detail: "Waiting for setup",
    offset: 0,
  },
];

/** Demo stations check in once a minute, each on its own second. */
function demoStations(now: number): Station[] {
  return DEMO.map(({ offset, ...station }) => ({
    ...station,
    lastSeenAt:
      station.state === "online"
        ? now - ((now + offset * 1000) % BEAT_MS)
        : undefined,
  }));
}

const STATE = {
  online: { label: "Online", text: "text-ems" },
  offline: { label: "Offline", text: "text-fire" },
  waiting: { label: "Waiting for setup", text: "text-gold" },
} as const;

function seen(station: Station, now: number): string {
  if (station.state !== "online" || !station.lastSeenAt) {
    return station.detail ?? STATE[station.state].label;
  }
  const seconds = Math.max(0, Math.round((now - station.lastSeenAt) / 1000));
  const when =
    seconds < 90 ? `${seconds}s ago` : `${Math.round(seconds / 60)} min ago`;
  return `Heartbeat ${when}${station.detail ? ` · ${station.detail}` : ""}`;
}

/**
 * Hub view: the hub in the middle, every node on its own link running out
 * from it, heartbeats travelling inward.
 */
function WebView({
  stations,
  online,
  now,
  width,
}: {
  stations: Station[];
  online: number;
  now: number;
  width: number;
}) {
  const compact = width < 520;
  const height = compact ? 540 : 460;
  const labelW = compact ? 104 : 150;
  const cx = width / 2;
  const cy = height / 2;
  const rx = compact ? width / 2 - 56 : width / 2 - labelW - 34;
  const ry = compact ? height / 2 - 96 : height / 2 - 62;
  const count = Math.max(stations.length, 3);

  const spots = stations.map((station, index) => {
    const angle =
      -Math.PI / 2 + Math.PI / count + (index * 2 * Math.PI) / count;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { station, cos, sin, x: cx + rx * cos, y: cy + ry * sin };
  });

  return (
    <div className="relative" style={{ height }}>
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        aria-hidden="true"
      >
        {spots.map(({ station, x, y }, index) => {
          const isOnline = station.state === "online";
          return (
            <g key={station.id}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={
                  isOnline
                    ? "#c89b3c"
                    : station.state === "offline"
                      ? "#bf5a3a"
                      : "#50515f"
                }
                strokeOpacity={isOnline ? 0.45 : 0.5}
                strokeWidth={isOnline ? 2.5 : 1.5}
                strokeDasharray={isOnline ? undefined : "4 5"}
                strokeLinecap="round"
              />
              {isOnline && (
                <circle r="3.5" fill="#c89b3c" className="web-run">
                  <animateMotion
                    dur={`${2 + (index % 4) * 0.45}s`}
                    begin={`-${(index * 0.6) % 2.4}s`}
                    repeatCount="indefinite"
                    path={`M${x.toFixed(1)},${y.toFixed(1)} L${cx.toFixed(1)},${cy.toFixed(1)}`}
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hub */}
      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        style={{ left: cx, top: cy + 20 }}
      >
        <span className="line-hub flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-gold bg-surface">
          <span className="h-4 w-4 rounded-full bg-gold" />
        </span>
        <span className="mt-1.5 rounded-md bg-surface/90 px-2 py-0.5 text-center">
          <span className="block text-xs font-bold text-textPrimary">
            Cloud hub
          </span>
          <span className="block text-[11px] text-textBody">
            {online} of {stations.length} online
          </span>
        </span>
      </div>

      {stations.length === 0 && (
        <p className="absolute inset-x-0 bottom-6 text-center text-xs text-textBody">
          No nodes yet.
        </p>
      )}

      {spots.map(({ station, cos, sin, x, y }) => {
        const isOnline = station.state === "online";
        const side =
          compact || Math.abs(cos) < 0.2 ? "stack" : cos > 0 ? "right" : "left";
        const below = sin >= 0;
        const labelStyle: React.CSSProperties =
          side === "right"
            ? {
                left: x + 20,
                top: y,
                transform: "translateY(-50%)",
                width: labelW,
              }
            : side === "left"
              ? {
                  left: x - 20 - labelW,
                  top: y,
                  transform: "translateY(-50%)",
                  width: labelW,
                  textAlign: "right",
                }
              : below
                ? {
                    left: x - labelW / 2,
                    top: y + 18,
                    width: labelW,
                    textAlign: "center",
                  }
                : {
                    left: x - labelW / 2,
                    top: y - 18,
                    transform: "translateY(-100%)",
                    width: labelW,
                    textAlign: "center",
                  };
        return (
          <div key={station.id}>
            <span
              className="absolute flex h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: x, top: y }}
            >
              {isOnline && (
                <span
                  key={station.lastSeenAt}
                  className="line-ping absolute inset-0 rounded-full bg-ems"
                />
              )}
              <span
                className={`relative h-[22px] w-[22px] rounded-full border-[3px] bg-surface ${
                  isOnline
                    ? "border-ems"
                    : station.state === "offline"
                      ? "border-fire/70"
                      : "border-dashed border-gold/70"
                }`}
              />
            </span>
            <div className="absolute" style={labelStyle}>
              <span className="block truncate text-sm font-semibold leading-tight text-textPrimary">
                {station.town}
              </span>
              <span
                className={`block truncate text-[11px] font-semibold ${STATE[station.state].text}`}
              >
                {isOnline ? "●" : station.state === "offline" ? "✕" : "○"}{" "}
                {STATE[station.state].label}
              </span>
              <span className="block truncate text-[11px] text-textMuted">
                {isOnline ? seen(station, now).split(" · ")[0] : station.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function NetworkLine({
  stations: real,
  now: serverNow,
}: {
  stations: Station[];
  now: number;
}) {
  const realOnline = real.filter(
    (station) => station.state === "online",
  ).length;
  const [choice, setChoice] = useState<"demo" | "real" | null>(null);
  const [now, setNow] = useState(serverNow);
  const [layoutChoice, setLayoutChoice] = useState<"line" | "web" | null>(null);
  const [width, setWidth] = useState(0);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const demo = choice ? choice === "demo" : realOnline < LIVE_MAP_MIN_ONLINE;
  const stations = demo ? demoStations(now) : real;
  const online = stations.filter(
    (station) => station.state === "online",
  ).length;
  const height = HUB + stations.length * ROW;
  // Phones get the line, wider screens the web, unless a view was picked.
  const layout = layoutChoice ?? (width >= WEB_MIN_WIDTH ? "web" : "line");

  return (
    <section className="rounded-xl border border-border bg-surface px-4 py-4 sm:px-5">
      <style>{`
        @keyframes line-run { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(var(--to)); opacity: 0; } }
        @keyframes line-ping { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(3.2); opacity: 0; } }
        @keyframes line-hub { 0%, 100% { box-shadow: 0 0 0 0 rgba(200,155,60,.35); } 50% { box-shadow: 0 0 0 9px rgba(200,155,60,0); } }
        .line-run { animation: line-run 3.2s linear infinite; }
        .line-ping { animation: line-ping 1.4s ease-out 1 both; }
        .line-hub { animation: line-hub 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .line-run, .line-ping, .line-hub { animation: none; }
          .line-run, .line-ping { opacity: 0; }
          .web-run { display: none; }
        }
      `}</style>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-textPrimary">Network map</h2>
            {demo && (
              <span className="rounded-full border border-gold/60 bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                Demo data
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-textBody">
            {demo
              ? `Sample nodes that show how the network will look. Real nodes take over when ${LIVE_MAP_MIN_ONLINE} are online (${realOnline} now).`
              : "Every node on the network and its last heartbeat."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setChoice(demo ? "real" : "demo")}
          className="shrink-0 rounded-md border border-borderBright px-3 py-1.5 text-xs font-semibold text-textBody transition-colors hover:text-textPrimary"
        >
          {demo ? "Show real" : "Show demo"}
        </button>
      </div>

      <div className="mb-4 flex gap-1.5">
        {(["line", "web"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLayoutChoice(option)}
            aria-pressed={layout === option}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
              layout === option
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-borderBright text-textBody hover:text-textPrimary"
            }`}
          >
            {option === "line" ? "Line" : "Hub"}
          </button>
        ))}
      </div>

      <div ref={frame}>
        {layout === "web" ? (
          width > 0 && (
            <WebView
              stations={stations}
              online={online}
              now={now}
              width={width}
            />
          )
        ) : (
          <div className="relative" style={{ height }}>
            {/* The line itself */}
            <div
              className="absolute left-[18px] w-[4px] rounded-full bg-gold/35"
              style={{ top: 26, height: Math.max(0, height - 26 - ROW / 2) }}
            />

            {/* Hub: the interchange every node reports to */}
            <div className="absolute left-0 top-0 flex h-[52px] items-center gap-4">
              <span className="line-hub flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-gold bg-surface">
                <span className="h-3 w-3 rounded-full bg-gold" />
              </span>
              <span>
                <span className="block text-sm font-bold text-textPrimary">
                  Cloud hub
                </span>
                <span className="block text-xs text-textBody">
                  {online} of {stations.length} nodes online
                </span>
              </span>
            </div>

            {stations.length === 0 && (
              <p className="absolute left-14 top-[84px] text-xs text-textBody">
                No nodes yet.
              </p>
            )}

            {stations.map((station, index) => {
              const top = HUB + index * ROW;
              const isOnline = station.state === "online";
              return (
                <div
                  key={station.id}
                  className="absolute left-0 right-0 flex items-center gap-4"
                  style={{ top, height: ROW }}
                >
                  {/* Heartbeat travelling up the line to the hub */}
                  {isOnline && (
                    <span
                      className="line-run pointer-events-none absolute left-[16px] h-2 w-2 rounded-full bg-gold"
                      style={
                        {
                          top: ROW / 2 - 4,
                          "--to": `${-(top + ROW / 2 - 26)}px`,
                          animationDelay: `${(index * 0.9) % 3}s`,
                          animationDuration: `${2 + index * 0.4}s`,
                        } as React.CSSProperties
                      }
                    />
                  )}
                  <span className="relative ml-[9px] flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                    {isOnline && (
                      <span
                        key={station.lastSeenAt}
                        className="line-ping absolute inset-0 rounded-full bg-ems"
                      />
                    )}
                    <span
                      className={`relative h-[22px] w-[22px] rounded-full border-[3px] bg-surface ${
                        isOnline
                          ? "border-ems"
                          : station.state === "offline"
                            ? "border-fire/70"
                            : "border-dashed border-gold/70"
                      }`}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-textPrimary">
                        {station.town}
                      </span>
                      <span
                        className={`shrink-0 text-[11px] font-semibold ${STATE[station.state].text}`}
                      >
                        {isOnline
                          ? "●"
                          : station.state === "offline"
                            ? "✕"
                            : "○"}{" "}
                        {STATE[station.state].label}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-textBody">
                      {station.name}
                    </span>
                    <span className="block truncate text-[11px] text-textMuted">
                      {seen(station, now)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
