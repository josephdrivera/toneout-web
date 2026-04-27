import type { Update } from "../data/updates";
import ShareButtons from "./ShareButtons";

/** Renders plain text but turns https:// URLs into outbound links */
function renderBodyWithLinks(body: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const segments = body.split(urlRegex);
  return segments.map((segment, index) => {
    if (/^https?:\/\//.test(segment)) {
      return (
        <a
          key={index}
          href={segment}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-medium text-accent underline-offset-2 hover:text-accent/80 hover:underline"
        >
          {segment}
        </a>
      );
    }
    return segment;
  });
}

const tagStyles: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-ems/10", text: "text-ems", label: "NEW" },
  improvement: { bg: "bg-law/10", text: "text-law", label: "IMPROVEMENT" },
  fix: { bg: "bg-fire/10", text: "text-fire", label: "FIX" },
  announcement: { bg: "bg-gold/10", text: "text-gold", label: "ANNOUNCEMENT" },
};

export default function UpdateItem({
  update,
  isActive = false,
}: {
  update: Update;
  isActive?: boolean;
}) {
  const tag = update.tag ? tagStyles[update.tag] : null;

  return (
    <>
      <time
        className={`mb-2.5 block text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 ${
          isActive ? "text-accent" : "text-textHint"
        }`}
      >
        {update.date}
      </time>

      <div className="rounded-xl border border-border bg-surface px-5 py-5 text-left transition-colors">
        {tag && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-[3px] px-1.5 py-0.5 text-[8px] font-extrabold tracking-[0.1em] ${tag.bg} ${tag.text}`}
            >
              {tag.label}
            </span>
          </div>
        )}
        <h2 className="mb-1.5 text-sm font-bold text-textSecondary">
          {update.title}
        </h2>
        <p className="whitespace-pre-line text-xs leading-relaxed text-textMuted">
          {renderBodyWithLinks(update.body)}
        </p>
        <ShareButtons title={update.title} id={update.id} />
      </div>
    </>
  );
}
