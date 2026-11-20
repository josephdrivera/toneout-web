"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QueueAlert } from "./QueueItem";
import QueueItem from "./QueueItem";

export default function EditorQueue() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/editor/queue", { cache: "no-store" });
      if (response.status === 401) {
        router.push("/editor/login");
        return;
      }
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Failed to load the queue.");
        return;
      }
      const data = (await response.json()) as { queue: QueueAlert[] };
      setQueue(data.queue);
      setError(null);
    } catch {
      setError("Failed to load the queue.");
    }
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  async function logout() {
    await fetch("/api/editor/login", { method: "DELETE" });
    router.push("/editor/login");
  }

  if (error) {
    return (
      <div className="rounded-xl border border-fire/25 bg-fire/5 px-5 py-4 text-sm text-fire">
        {error}
      </div>
    );
  }
  if (queue === null) {
    return <p className="text-sm text-textMuted">Loading the queue…</p>;
  }

  const pending = queue.filter((alert) => alert.status === "pending");
  const flagged = queue.filter((alert) => alert.status === "published");

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <p className="text-xs text-textHint">
          {pending.length} held · {flagged.length} flagged
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-md border border-borderLight px-2.5 py-1 text-[11px] font-semibold text-textMuted transition-colors hover:text-textBody"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-md border border-borderLight px-2.5 py-1 text-[11px] font-semibold text-textMuted transition-colors hover:text-textBody"
          >
            Log out
          </button>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-textSecondary">
          Pending — held for review
        </h2>
        {pending.length === 0 ? (
          <p className="text-xs text-textHint">Nothing waiting. Nice.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((alert) => (
              <QueueItem key={alert._id} alert={alert} onAction={refresh} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-textSecondary">
          Published — flagged for review
        </h2>
        {flagged.length === 0 ? (
          <p className="text-xs text-textHint">No flagged items.</p>
        ) : (
          <div className="space-y-3">
            {flagged.map((alert) => (
              <QueueItem key={alert._id} alert={alert} onAction={refresh} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
