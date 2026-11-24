"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type TrendDay = { date: string; metrics: Record<string, number> };

export type TrendMetric = {
  key: string;
  label: string;
  noun: string;
  /** Daily counts (add them up) rather than a running level. */
  sum?: boolean;
};

const LEVELS: TrendMetric[] = [
  { key: "subscribers", label: "Subscribers", noun: "tone alert subscribers" },
  { key: "devices", label: "Registered", noun: "phones registered" },
  { key: "active_7d", label: "Active", noun: "phones seen in 7 days" },
];

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

const HEIGHT = 240;
const PAD = { top: 18, right: 14, bottom: 28, left: 38 };
const DAY_MS = 86400000;

function dayTime(date: string): number {
  return new Date(`${date}T00:00:00Z`).getTime();
}

function dateLabel(date: string, long = false): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(long ? { weekday: "short" } : {}),
  });
}

/** Whole-number ticks that bracket the data with a little headroom. */
function yTicks(min: number, max: number): number[] {
  const span = Math.max(max - min, 2);
  const rough = span / 3;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(
    1,
    [1, 2, 5, 10].map((n) => n * power).find((n) => n >= rough) ?? rough,
  );
  const low = Math.max(0, Math.floor((min - span * 0.15) / step) * step);
  const high = Math.ceil((max + span * 0.15) / step) * step;
  const ticks: number[] = [];
  for (let value = low; value <= high + step / 2; value += step) {
    ticks.push(Math.round(value));
  }
  return ticks;
}

const pill = (active: boolean) =>
  `rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
    active
      ? "border-gold/60 bg-gold/10 text-gold"
      : "border-borderBright text-textBody hover:text-textPrimary"
  }`;

export default function TrendChart({
  days,
  metrics = LEVELS,
  id = "trend",
}: {
  days: TrendDay[];
  metrics?: TrendMetric[];
  /** Unique per chart on a page (names the gradient). */
  id?: string;
}) {
  const [metric, setMetric] = useState(metrics[0].key);
  const [range, setRange] = useState<number>(30);
  const [hover, setHover] = useState<number | null>(null);
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

  const info = metrics.find((option) => option.key === metric) ?? metrics[0];

  const points = useMemo(() => {
    if (days.length === 0) return [];
    const end = dayTime(days[0].date);
    const start = end - (range - 1) * DAY_MS;
    return days
      .filter(
        (day) =>
          dayTime(day.date) >= start && day.metrics[metric] !== undefined,
      )
      .map((day) => ({
        date: day.date,
        time: dayTime(day.date),
        value: day.metrics[metric],
      }))
      .reverse();
  }, [days, metric, range]);

  const last = points[points.length - 1];
  const first = points[0];
  const delta = last && first ? last.value - first.value : 0;
  const total = points.reduce((sum, point) => sum + point.value, 0);

  const plot = useMemo(() => {
    if (points.length === 0 || width === 0) return null;
    const values = points.map((point) => point.value);
    const ticks = yTicks(Math.min(...values), Math.max(...values));
    const low = ticks[0];
    const high = ticks[ticks.length - 1];
    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const t0 = points[0].time;
    const tSpan = Math.max(points[points.length - 1].time - t0, 1);
    const x = (time: number) =>
      points.length === 1
        ? PAD.left + innerW / 2
        : PAD.left + ((time - t0) / tSpan) * innerW;
    const y = (value: number) =>
      PAD.top + innerH - ((value - low) / (high - low || 1)) * innerH;
    const xy = points.map((point) => ({ x: x(point.time), y: y(point.value) }));
    const line = xy
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ");
    const base = PAD.top + innerH;
    const area =
      xy.length > 1
        ? `${line} L${xy[xy.length - 1].x.toFixed(1)},${base} L${xy[0].x.toFixed(1)},${base} Z`
        : "";
    return { ticks, xy, line, area, y, base };
  }, [points, width]);

  function track(event: React.PointerEvent<SVGRectElement>) {
    if (!plot) return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left;
    let nearest = 0;
    plot.xy.forEach((p, index) => {
      if (Math.abs(p.x - px) < Math.abs(plot.xy[nearest].x - px))
        nearest = index;
    });
    setHover(nearest);
  }

  const active = hover !== null && hover < points.length ? hover : null;
  const shown = active !== null ? points[active] : last;
  const previous = active !== null && active > 0 ? points[active - 1] : null;
  const xLabels =
    points.length <= 1
      ? points.map((_, index) => index)
      : Array.from(
          new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]),
        );

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-4 sm:px-5">
      <style>{`
        @keyframes trend-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes trend-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes trend-pulse { 0% { r: 4; opacity: .55; } 100% { r: 13; opacity: 0; } }
        .trend-line { stroke-dasharray: 1; animation: trend-draw .9s ease-out both; }
        .trend-area { animation: trend-fade .9s ease-out .25s both; }
        .trend-pulse { animation: trend-pulse 2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .trend-line, .trend-area, .trend-pulse { animation: none; }
          .trend-pulse { opacity: 0; }
        }
      `}</style>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {metrics.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setMetric(option.key)}
              className={pill(metric === option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {RANGES.map((option) => (
            <button
              key={option.days}
              type="button"
              onClick={() => setRange(option.days)}
              className={pill(range === option.days)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-[34px] font-extrabold leading-none tracking-[-1px] text-textPrimary">
            {!shown
              ? "—"
              : (info.sum && active === null
                  ? total
                  : shown.value
                ).toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs text-textBody">
            {info.noun}
            {shown
              ? ` · ${
                  active !== null
                    ? dateLabel(shown.date, true)
                    : info.sum
                      ? `${dateLabel(first.date)} to ${dateLabel(last.date)}`
                      : "today"
                }`
              : ""}
          </p>
        </div>
        {points.length > 1 && (
          <p className="pb-0.5 text-right text-xs text-textBody">
            {active !== null && previous ? (
              <>
                <span className="font-semibold text-textPrimary">
                  {shown.value - previous.value > 0 ? "+" : ""}
                  {(shown.value - previous.value).toLocaleString()}
                </span>{" "}
                from the day before
              </>
            ) : info.sum ? (
              <>
                <span className="font-semibold text-textPrimary">
                  {(total / points.length).toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                </span>{" "}
                a day on average
              </>
            ) : (
              <>
                <span className="font-semibold text-textPrimary">
                  {delta > 0 ? "▲ +" : delta < 0 ? "▼ " : ""}
                  {delta.toLocaleString()}
                </span>{" "}
                since {dateLabel(first.date)}
              </>
            )}
          </p>
        )}
      </div>

      <div ref={frame} className="relative" style={{ height: HEIGHT }}>
        {plot && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`${info.noun} over the last ${range} days`}
            className="block select-none"
          >
            <defs>
              <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c89b3c" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#c89b3c" stopOpacity="0" />
              </linearGradient>
            </defs>

            {plot.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={plot.y(tick)}
                  y2={plot.y(tick)}
                  stroke="#1a1b24"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 8}
                  y={plot.y(tick) + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#50515f"
                >
                  {tick.toLocaleString()}
                </text>
              </g>
            ))}

            {xLabels.map((index) => (
              <text
                key={points[index].date}
                x={plot.xy[index].x}
                y={HEIGHT - 8}
                textAnchor={
                  points.length === 1 ||
                  (index > 0 && index < points.length - 1)
                    ? "middle"
                    : index === 0
                      ? "start"
                      : "end"
                }
                fontSize="10"
                fill="#50515f"
              >
                {dateLabel(points[index].date)}
              </text>
            ))}

            <g key={`${metric}-${range}-${points.length}`}>
              {plot.area && (
                <path
                  d={plot.area}
                  fill={`url(#${id}-fill)`}
                  className="trend-area"
                />
              )}
              {plot.xy.length > 1 && (
                <path
                  d={plot.line}
                  pathLength={1}
                  fill="none"
                  stroke="#c89b3c"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="trend-line"
                />
              )}
            </g>

            {active !== null && (
              <line
                x1={plot.xy[active].x}
                x2={plot.xy[active].x}
                y1={PAD.top}
                y2={plot.base}
                stroke="#50515f"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}

            {active === null && !info.sum && (
              <circle
                cx={plot.xy[plot.xy.length - 1].x}
                cy={plot.xy[plot.xy.length - 1].y}
                r="4"
                fill="#c89b3c"
                className="trend-pulse"
              />
            )}
            {(() => {
              const dot = plot.xy[active ?? plot.xy.length - 1];
              return (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r="4.5"
                  fill="#c89b3c"
                  stroke="#0f1018"
                  strokeWidth="2"
                />
              );
            })()}

            <rect
              x={PAD.left - 10}
              y={0}
              width={Math.max(0, width - PAD.left - PAD.right + 20)}
              height={HEIGHT}
              fill="transparent"
              style={{ touchAction: "pan-y", cursor: "crosshair" }}
              onPointerDown={track}
              onPointerMove={track}
              onPointerLeave={() => setHover(null)}
              onPointerCancel={() => setHover(null)}
            />
          </svg>
        )}
        {points.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-textBody">
            No reports in this period yet.
          </p>
        )}
      </div>

      {points.length === 1 && (
        <p className="mt-2 text-[11px] text-textMuted">
          This is the first day of reports. The line fills in as each day comes
          in.
        </p>
      )}
    </div>
  );
}
