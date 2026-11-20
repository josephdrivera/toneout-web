"use client";

import { useState } from "react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  VERIFICATION_LABELS,
  VERIFICATION_LEVELS,
  type Category,
  type Verification,
} from "../../../convex/lib/taxonomy";
import CategoryChip from "../news/CategoryChip";
import VerificationBadge from "../news/VerificationBadge";
import { relativeTime } from "../news/AlertCard";

export type QueueAlert = {
  _id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: number;
  detectedAt: number;
  category: Category;
  verification: Verification;
  status: "published" | "pending" | "rejected";
  reviewFlag: boolean;
  town?: string;
  state?: string;
  department?: string;
  sourceName: string;
  sourceTrustLevel: number;
  duplicateCandidate: { _id: string; title: string; link: string } | null;
};

async function postAction(body: Record<string, unknown>): Promise<string | null> {
  try {
    const response = await fetch("/api/editor/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return null;
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    return data?.error ?? "Action failed.";
  } catch {
    return "Action failed.";
  }
}

export default function QueueItem({
  alert,
  onAction,
}: {
  alert: QueueAlert;
  onAction: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [town, setTown] = useState(alert.town ?? "");
  const [department, setDepartment] = useState(alert.department ?? "");
  const [now] = useState(() => Date.now());

  async function run(body: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    const failure = await postAction({ alertId: alert._id, ...body });
    if (failure) {
      setError(failure);
    } else {
      await onAction();
    }
    setBusy(false);
  }

  const location = [alert.town, alert.state].filter(Boolean).join(", ");

  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <VerificationBadge verification={alert.verification} />
        <CategoryChip category={alert.category} />
        <span className="rounded-[4px] bg-surfaceLight px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-textMuted">
          L{alert.sourceTrustLevel} · {alert.sourceName}
        </span>
        <span className="ml-auto text-[11px] text-textHint">
          {relativeTime(alert.publishedAt, now)}
        </span>
      </div>

      <h3 className="mb-1 text-sm font-bold leading-snug text-textSecondary">
        <a
          href={alert.link}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-textPrimary"
        >
          {alert.title}
        </a>
      </h3>
      {alert.summary && (
        <p className="mb-2 text-xs leading-relaxed text-textMuted">
          {alert.summary}
        </p>
      )}
      {location && (
        <p className="mb-2 text-[11px] text-textHint">{location}</p>
      )}

      {alert.duplicateCandidate && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2 text-[11px] text-gold">
          <span>
            Possible duplicate of{" "}
            <a
              href={alert.duplicateCandidate.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              {alert.duplicateCandidate.title}
            </a>
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run({
                action: "markDuplicate",
                duplicateOf: alert.duplicateCandidate?._id,
              })
            }
            className="rounded-md border border-gold/40 px-2 py-0.5 font-bold transition-colors hover:bg-gold/10 disabled:opacity-50"
          >
            Mark duplicate
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-borderLight pt-3">
        {alert.status === "pending" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run({ action: "approve" })}
            className="rounded-md bg-ems/15 px-2.5 py-1 text-[11px] font-bold text-ems transition-colors hover:bg-ems/25 disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {alert.status === "published" && alert.reviewFlag && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run({ action: "clearReviewFlag" })}
            className="rounded-md bg-ems/15 px-2.5 py-1 text-[11px] font-bold text-ems transition-colors hover:bg-ems/25 disabled:opacity-50"
          >
            Looks fine
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void run({ action: "reject" })}
          className="rounded-md bg-fire/10 px-2.5 py-1 text-[11px] font-bold text-fire transition-colors hover:bg-fire/20 disabled:opacity-50"
        >
          Reject
        </button>

        <select
          value={alert.verification}
          disabled={busy}
          onChange={(event) =>
            void run({
              action: "setVerification",
              verification: event.target.value,
            })
          }
          className="rounded-md border border-borderLight bg-background px-2 py-1 text-[11px] text-textMuted focus:outline-none"
          aria-label="Verification level"
        >
          {VERIFICATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {VERIFICATION_LABELS[level]}
            </option>
          ))}
        </select>

        <select
          value={alert.category}
          disabled={busy}
          onChange={(event) =>
            void run({ action: "updateDetails", category: event.target.value })
          }
          className="rounded-md border border-borderLight bg-background px-2 py-1 text-[11px] text-textMuted focus:outline-none"
          aria-label="Category"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={town}
          disabled={busy}
          onChange={(event) => setTown(event.target.value)}
          placeholder="Town"
          className="w-32 rounded-md border border-borderLight bg-background px-2 py-1 text-[11px] text-textPrimary placeholder:text-textHint focus:border-borderBright focus:outline-none"
        />
        <input
          type="text"
          value={department}
          disabled={busy}
          onChange={(event) => setDepartment(event.target.value)}
          placeholder="Department"
          className="w-48 rounded-md border border-borderLight bg-background px-2 py-1 text-[11px] text-textPrimary placeholder:text-textHint focus:border-borderBright focus:outline-none"
        />
        <button
          type="button"
          disabled={
            busy ||
            (town === (alert.town ?? "") &&
              department === (alert.department ?? ""))
          }
          onClick={() =>
            void run({
              action: "updateDetails",
              town: town || undefined,
              department: department || undefined,
            })
          }
          className="rounded-md border border-borderLight px-2.5 py-1 text-[11px] font-semibold text-textMuted transition-colors hover:text-textBody disabled:opacity-40"
        >
          Save details
        </button>
      </div>

      {error && <p className="mt-2 text-[11px] text-fire">{error}</p>}
    </div>
  );
}
