"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Platform = "ios" | "android" | undefined;

type Item = {
  id: string;
  kind: "bug" | "request" | "feedback" | "idea";
  text: string;
  email?: string;
  platform?: Platform;
  at: number;
};

type Signup = { _id: string; email: string; platform?: Platform; at: number };

type InboxData = {
  now: number;
  feedback: Array<{
    _id: string;
    topic: "request" | "feedback" | "bug";
    message: string;
    email?: string;
    platform?: Platform;
    at: number;
  }>;
  ideas: Array<{ _id: string; idea: string; email?: string; at: number }>;
  waitlist: Signup[];
};

const KIND: Record<Item["kind"], { label: string; color: string }> = {
  bug: { label: "Bug", color: "border-fire/50 text-fire" },
  request: { label: "Request", color: "border-gold/50 text-gold" },
  feedback: { label: "Feedback", color: "border-accent/60 text-accent" },
  idea: { label: "Idea", color: "border-ems/60 text-ems" },
};

const FILTERS = ["All", "Bug", "Request", "Feedback", "Idea"] as const;

function ago(timestamp: number, now: number): string {
  const minutes = Math.max(0, Math.round((now - timestamp) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hr ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function platformLabel(platform: Platform): string | null {
  if (platform === "ios") return "iPhone";
  if (platform === "android") return "Android";
  return null;
}

export default function Inbox() {
  const router = useRouter();
  const [data, setData] = useState<InboxData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [showAllSignups, setShowAllSignups] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/inbox", { cache: "no-store" });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        setError("Could not load the inbox.");
        return;
      }
      setData((await response.json()) as InboxData);
      setError(null);
    } catch {
      setError("Could not load the inbox.");
    }
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const items = useMemo<Item[]>(() => {
    if (!data) return [];
    const merged: Item[] = [
      ...data.feedback.map((row) => ({
        id: row._id,
        kind: row.topic,
        text: row.message,
        email: row.email,
        platform: row.platform,
        at: row.at,
      })),
      ...data.ideas.map((row) => ({
        id: row._id,
        kind: "idea" as const,
        text: row.idea,
        email: row.email,
        at: row.at,
      })),
    ];
    return merged.sort((a, b) => b.at - a.at);
  }, [data]);

  if (data === null) {
    return (
      <p className="text-sm text-textBody">{error ?? "Loading the inbox…"}</p>
    );
  }

  const shown = items.filter(
    (item) => filter === "All" || KIND[item.kind].label === filter,
  );
  const counts = {
    Bug: items.filter((item) => item.kind === "bug").length,
    Request: items.filter((item) => item.kind === "request").length,
    Feedback: items.filter((item) => item.kind === "feedback").length,
    Idea: items.filter((item) => item.kind === "idea").length,
  };
  const iphone = data.waitlist.filter((row) => row.platform === "ios").length;
  const android = data.waitlist.filter(
    (row) => row.platform === "android",
  ).length;
  const signups = showAllSignups ? data.waitlist : data.waitlist.slice(0, 8);

  return (
    <div className="space-y-10">
      {error && (
        <p className="rounded-lg border border-fire/30 bg-fire/5 px-4 py-3 text-xs text-fire">
          {error}
        </p>
      )}

      <section>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-bold text-textPrimary">
            Messages from the site ({items.length})
          </h2>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-md border border-borderBright px-3 py-1.5 text-xs font-semibold text-textBody transition-colors hover:text-textPrimary"
          >
            Refresh
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-textBody">
          Bug reports, requests, feedback and roadmap ideas sent through the
          forms on toneout.app. Requests to host a node are on the Nodes tab.
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                filter === option
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-borderBright text-textBody hover:text-textPrimary"
              }`}
            >
              {option}
              {option === "All" ? "" : ` ${counts[option]}`}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-5 py-6 text-sm text-textBody">
            Nothing here yet.
          </p>
        ) : (
          <div className="space-y-3">
            {shown.map((item) => {
              const kind = KIND[item.kind];
              const platform = platformLabel(item.platform);
              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-border bg-surface px-5 py-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${kind.color}`}
                    >
                      {kind.label}
                    </span>
                    <span className="text-[11px] text-textMuted">
                      {platform ? `${platform} · ` : ""}
                      {ago(item.at, data.now)}
                    </span>
                  </div>
                  <p className="whitespace-pre-line break-words text-sm leading-relaxed text-textSecondary">
                    {item.text}
                  </p>
                  {item.email ? (
                    <a
                      href={`mailto:${item.email}`}
                      className="mt-2 inline-block break-all text-xs text-accent hover:underline"
                    >
                      {item.email}
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-textMuted">
                      No email left
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-sm font-bold text-textPrimary">
          Waitlist sign-ups ({data.waitlist.length})
        </h2>
        <p className="mb-4 text-xs text-textBody">
          {iphone} iPhone · {android} Android ·{" "}
          {data.waitlist.length - iphone - android} did not say
        </p>
        {data.waitlist.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-5 py-6 text-sm text-textBody">
            Nobody has signed up yet.
          </p>
        ) : (
          <div className="rounded-xl border border-border bg-surface">
            {signups.map((row, index) => (
              <div
                key={row._id}
                className={`flex items-center justify-between gap-3 px-5 py-2.5 ${
                  index > 0 ? "border-t border-border" : ""
                }`}
              >
                <a
                  href={`mailto:${row.email}`}
                  className="min-w-0 truncate text-xs text-textSecondary hover:text-accent"
                >
                  {row.email}
                </a>
                <span className="shrink-0 text-[11px] text-textMuted">
                  {platformLabel(row.platform) ?? "—"} · {ago(row.at, data.now)}
                </span>
              </div>
            ))}
          </div>
        )}
        {data.waitlist.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllSignups(!showAllSignups)}
            className="mt-3 text-xs text-textBody hover:text-textPrimary"
          >
            {showAllSignups
              ? "Show fewer"
              : `Show all ${data.waitlist.length}`}
          </button>
        )}
      </section>
    </div>
  );
}
