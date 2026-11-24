"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TrendChart from "./TrendChart";

type Day = { date: string; at: number; metrics: Record<string, number> };
type StatsData = { now: number; days: Day[] };

const DEPT_PREFIX = "dept:";

/** "glastonbury-co-2" -> "Glastonbury Company 2" */
function departmentName(id: string): string {
  return id
    .replace(/-co-(\d+)$/, " Company $1")
    .replace(/-allcall$/, " All-Call")
    .split(/[-\s]/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ")
    .replace("All Call", "All-Call");
}

function shortDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ago(timestamp: number, now: number): string {
  const minutes = Math.max(0, Math.round((now - timestamp) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

/** Change against the closest report at least `daysBack` days older. */
function change(days: Day[], key: string, daysBack: number): number | null {
  const latest = days[0];
  const cutoff = new Date(`${latest.date}T00:00:00Z`).getTime() - daysBack * 86400000;
  const earlier = days.find(
    (day) => new Date(`${day.date}T00:00:00Z`).getTime() <= cutoff,
  );
  if (!earlier || earlier.metrics[key] === undefined) return null;
  return (latest.metrics[key] ?? 0) - earlier.metrics[key];
}

function Tile({
  label,
  value,
  detail,
  delta,
  children,
}: {
  label: string;
  value: number | undefined;
  detail?: string;
  delta?: number | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-textMuted">
        {label}
      </p>
      <p className="mt-1 text-[28px] font-extrabold leading-none tracking-[-0.8px] text-textPrimary">
        {value === undefined ? "—" : value.toLocaleString()}
      </p>
      {detail && <p className="mt-2 text-xs text-textBody">{detail}</p>}
      {delta !== undefined && delta !== null && (
        <p className="mt-1 text-[11px] text-textMuted">
          {delta > 0 ? `+${delta}` : delta} in the last 7 days
        </p>
      )}
      {children}
    </div>
  );
}

export default function StatsBoard() {
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllDays, setShowAllDays] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/stats", { cache: "no-store" });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        setError("Could not load the stats.");
        return;
      }
      setData((await response.json()) as StatsData);
      setError(null);
    } catch {
      setError("Could not load the stats.");
    }
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    // Keep the page current while it is left open or reopened on a phone.
    const timer = setInterval(() => void refresh(), 5 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  if (data === null) {
    return <p className="text-sm text-textBody">{error ?? "Loading stats…"}</p>;
  }

  const latest = data.days[0];
  const m = latest?.metrics ?? {};
  const departments = Object.entries(m)
    .filter(([key]) => key.startsWith(DEPT_PREFIX))
    .map(([key, count]) => ({ id: key.slice(DEPT_PREFIX.length), count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
  const topDepartment = Math.max(1, ...departments.map((dept) => dept.count));
  const history = showAllDays ? data.days : data.days.slice(0, 14);

  return (
    <div className="space-y-10">
      {error && (
        <p className="rounded-lg border border-fire/30 bg-fire/5 px-4 py-3 text-xs text-fire">
          {error}
        </p>
      )}

      <section>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-bold text-textPrimary">Tone Alerts</h2>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-md border border-borderBright px-3 py-1.5 text-xs font-semibold text-textBody transition-colors hover:text-textPrimary"
          >
            Refresh
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-textBody">
          {latest
            ? `Counted on the main node. Last report ${ago(latest.at, data.now)}.`
            : "The main node has not sent a report yet."}
        </p>

        {latest && (
          <>
            <div className="mb-3">
              <TrendChart days={data.days} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Tile
                label="Tone alert subscribers"
                value={m.subscribers}
                detail={`${m.subscribers_ios ?? 0} iPhone · ${m.subscribers_android ?? 0} Android`}
                delta={change(data.days, "subscribers", 7)}
              />
              <Tile
                label="Phones registered"
                value={m.devices}
                detail={`${m.devices_ios ?? 0} iPhone · ${m.devices_android ?? 0} Android`}
                delta={change(data.days, "devices", 7)}
              />
              <Tile
                label="Seen in the last 7 days"
                value={m.active_7d}
                detail="Registered phones that checked in this week"
              />
              <Tile
                label="Seen in the last 30 days"
                value={m.active_30d}
                detail="Registered phones that checked in this month"
              />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-textMuted">
              A registered phone is one that opened the app and allowed
              notifications. It is not the same as a store download.
            </p>
          </>
        )}
      </section>

      {departments.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-bold text-textPrimary">
            Subscribers by alert
          </h2>
          <div className="space-y-3 rounded-xl border border-border bg-surface px-5 py-4">
            {departments.map((dept) => (
              <div key={dept.id}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-xs text-textSecondary">
                    {departmentName(dept.id)}
                  </span>
                  <span className="text-xs font-semibold text-textPrimary">
                    {dept.count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-borderBright">
                  <div
                    className="h-1.5 rounded-full bg-gold"
                    style={{ width: `${(dept.count / topDepartment) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.days.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-bold text-textPrimary">Day by day</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-textMuted">
                  <th className="px-5 py-2.5 font-semibold">Day</th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Subscribers
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Registered
                  </th>
                  <th className="px-5 py-2.5 text-right font-semibold">
                    Seen in 7 days
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((day) => (
                  <tr key={day.date} className="border-t border-border">
                    <td className="px-5 py-2.5 text-textSecondary">
                      {shortDate(day.date)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-textSecondary">
                      {day.metrics.subscribers ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-textSecondary">
                      {day.metrics.devices ?? "—"}
                    </td>
                    <td className="px-5 py-2.5 text-right text-textSecondary">
                      {day.metrics.active_7d ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.days.length > 14 && (
            <button
              type="button"
              onClick={() => setShowAllDays(!showAllDays)}
              className="mt-3 text-xs text-textBody hover:text-textPrimary"
            >
              {showAllDays ? "Show fewer" : `Show all ${data.days.length} days`}
            </button>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-1 text-sm font-bold text-textPrimary">
          Store numbers
        </h2>
        <p className="rounded-xl border border-border bg-surface px-5 py-4 text-xs leading-relaxed text-textBody">
          App Store downloads, Google Play installs and Company Alerts
          purchases are not connected yet. Each needs a read-only reporting key
          from the store account.
        </p>
      </section>
    </div>
  );
}
