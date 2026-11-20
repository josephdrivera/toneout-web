import type { Doc } from "../../../convex/_generated/dataModel";
import CategoryChip from "./CategoryChip";
import VerificationBadge from "./VerificationBadge";

export type PublicAlert = Doc<"alerts"> & {
  sourceName: string;
  sourceTrustLevel: number;
};

export function relativeTime(timestamp: number, now: number): string {
  const diff = now - timestamp;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function absoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

const cardStyles: Record<string, string> = {
  automated: "border-border",
  official: "border-border border-l-2 border-l-fire",
  developing: "border-border border-l-2 border-l-law",
  confirmed: "border-borderBright border-l-2 border-l-ems",
  verified: "border-borderBright border-l-2 border-l-ems",
};

export default function AlertCard({
  alert,
  now,
}: {
  alert: PublicAlert;
  now: number;
}) {
  const location = [alert.town, alert.state].filter(Boolean).join(", ");
  const showUpdated = alert.updatedAt > alert.detectedAt + 60_000;

  return (
    <article
      className={`rounded-xl border bg-surface px-5 py-4 ${cardStyles[alert.verification] ?? "border-border"}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <VerificationBadge verification={alert.verification} />
        <CategoryChip category={alert.category} />
        <span
          className="ml-auto text-[11px] text-textHint"
          title={absoluteTime(alert.publishedAt)}
        >
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
        <p className="mb-2.5 text-xs leading-relaxed text-textMuted line-clamp-2">
          {alert.summary}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-textHint">
        <span className="font-semibold text-textMuted">{alert.sourceName}</span>
        {location && <span>{location}</span>}
        {alert.department && <span>{alert.department}</span>}
        <span title={absoluteTime(alert.detectedAt)}>
          detected {relativeTime(alert.detectedAt, now)}
        </span>
        {showUpdated && (
          <span title={absoluteTime(alert.updatedAt)}>
            updated {relativeTime(alert.updatedAt, now)}
          </span>
        )}
        <a
          href={alert.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 font-medium text-textMuted transition-colors hover:text-textBody"
        >
          Source
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="opacity-50"
          >
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </a>
      </div>
    </article>
  );
}
