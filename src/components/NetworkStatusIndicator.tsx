"use client";

import { useEffect, useState } from "react";

type Status = "live" | "degraded" | "offline" | "loading";

type ApiResponse = {
  status: "live" | "degraded" | "offline";
  feeds_active?: number;
  feeds_total?: number;
};

const POLL_INTERVAL_MS = 30_000;

const STATUS_META: Record<
  Status,
  { dot: string; label: string; title: string }
> = {
  live: {
    dot: "bg-[#4d8a5c] shadow-[0_0_6px_rgba(77,138,92,0.5)]",
    label: "Network Live",
    title: "All feeds are streaming",
  },
  degraded: {
    dot: "bg-[#c89b3c] shadow-[0_0_6px_rgba(200,155,60,0.5)]",
    label: "Network Degraded",
    title: "Some feeds are not streaming",
  },
  offline: {
    dot: "bg-[#bf5a3a] shadow-[0_0_6px_rgba(191,90,58,0.5)]",
    label: "Network Offline",
    title: "Feed network is unreachable",
  },
  loading: {
    dot: "bg-[#50515f]",
    label: "Checking\u2026",
    title: "Checking feed network status",
  },
};

export default function NetworkStatusIndicator() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/network-status", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setStatus("offline");
          return;
        }
        const data = (await res.json()) as ApiResponse;
        if (cancelled) return;
        if (
          data.status === "live" ||
          data.status === "degraded" ||
          data.status === "offline"
        ) {
          setStatus(data.status);
        } else {
          setStatus("offline");
        }
      } catch {
        if (!cancelled) setStatus("offline");
      }
    };

    void check();
    const id = setInterval(() => void check(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const meta = STATUS_META[status];

  return (
    <div
      className="flex items-center gap-1.5"
      role="status"
      aria-live="polite"
      title={meta.title}
    >
      <span
        className={[
          "size-1.5 shrink-0 rounded-full transition-colors",
          meta.dot,
        ].join(" ")}
        aria-hidden
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-textMuted">
        {meta.label}
      </span>
    </div>
  );
}
