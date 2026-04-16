import Link from "next/link";
import { updates } from "../../data/updates";
import ShareButtons from "../../components/ShareButtons";

const tagStyles: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-ems/10", text: "text-ems", label: "NEW" },
  improvement: { bg: "bg-law/10", text: "text-law", label: "IMPROVEMENT" },
  fix: { bg: "bg-fire/10", text: "text-fire", label: "FIX" },
  announcement: { bg: "bg-gold/10", text: "text-gold", label: "ANNOUNCEMENT" },
};

export default function UpdatesPage() {
  return (
    <main className="relative bg-background pt-20 text-textSecondary">
      <div
        className="pointer-events-none absolute left-1/2 top-[60px] size-[400px] -translate-x-1/2 rounded-full opacity-[0.04] [background:radial-gradient(circle,#4878a8_0%,transparent_70%)]"
        aria-hidden
      />

      <section className="relative mx-auto max-w-[620px] px-6 pt-12 pb-20">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-textHint transition-colors hover:text-textMuted"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <h1 className="mb-2 text-[32px] font-extrabold leading-tight tracking-[-1px] text-textPrimary">
          Updates
        </h1>
        <p className="mb-10 text-sm text-textMuted">
          Development progress, new features, and announcements.
        </p>

        <div className="space-y-4">
          {updates.map((update) => {
            const tag = update.tag ? tagStyles[update.tag] : null;

            return (
              <article
                key={update.id}
                id={update.id}
                className="rounded-xl border border-border bg-surface px-5 py-5 text-left"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <time className="text-[11px] font-medium text-textHint">
                    {update.date}
                  </time>
                  {tag && (
                    <span
                      className={`rounded-[3px] px-1.5 py-0.5 text-[8px] font-extrabold tracking-[0.1em] ${tag.bg} ${tag.text}`}
                    >
                      {tag.label}
                    </span>
                  )}
                </div>
                <h2 className="mb-1.5 text-sm font-bold text-textSecondary">
                  {update.title}
                </h2>
                <p className="text-xs leading-relaxed text-textMuted">
                  {update.body}
                </p>
                <ShareButtons title={update.title} id={update.id} />
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
