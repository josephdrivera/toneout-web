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

const ctaToneStyles: Record<"fire" | "accent", string> = {
  fire: "border-fire/25 bg-fire/10 text-fire hover:border-fire/45 hover:bg-fire/15",
  accent:
    "border-accent/25 bg-accent/10 text-accent hover:border-accent/45 hover:bg-accent/15",
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
        {update.blocks
          ? update.blocks.map((block, index) => {
              if (block.type === "taggedLine") {
                return (
                  <p
                    key={index}
                    className="mt-3 text-xs leading-relaxed text-textMuted"
                  >
                    <span className="mr-1.5 inline-block rounded-[3px] bg-gold/10 px-1.5 py-0.5 align-[1px] text-[8px] font-extrabold tracking-[0.1em] text-gold">
                      {block.tag}
                    </span>
                    {renderBodyWithLinks(block.text)}
                  </p>
                );
              }
              if (block.type === "disclaimer") {
                return (
                  <div
                    key={index}
                    className="mt-3 rounded-md border border-border border-l-2 border-l-fire bg-surfaceLight px-4 py-3 text-[11px] leading-relaxed text-textMuted"
                  >
                    {renderBodyWithLinks(block.text)}
                  </div>
                );
              }
              return (
                <p
                  key={index}
                  className={`whitespace-pre-line text-xs leading-relaxed text-textMuted ${
                    index > 0 ? "mt-3" : ""
                  }`}
                >
                  {renderBodyWithLinks(block.text)}
                </p>
              );
            })
          : update.body && (
              <p className="whitespace-pre-line text-xs leading-relaxed text-textMuted">
                {renderBodyWithLinks(update.body)}
              </p>
            )}
        {update.cta && (
          <div className="mt-4">
            <a
              href={update.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                ctaToneStyles[update.cta.tone ?? "accent"]
              }`}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              {update.cta.label}
            </a>
            {update.cta.note && (
              <p className="mt-2 text-[11px] leading-relaxed text-textHint">
                {update.cta.note.prefix}
                <a
                  href={update.cta.note.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent underline-offset-2 hover:text-accent/80 hover:underline"
                >
                  {update.cta.note.linkLabel}
                </a>
              </p>
            )}
          </div>
        )}
        <ShareButtons title={update.title} id={update.id} />
      </div>
    </>
  );
}
