import Link from "next/link";
import {
  roadmap,
  STATUS_ORDER,
  STATUS_META,
  type RoadmapStatus,
} from "../../data/roadmap";
import IdeaForm from "../../components/IdeaForm";

const statusStyles: Record<
  RoadmapStatus,
  { dot: string; badgeBg: string; badgeText: string; border: string }
> = {
  shipped: {
    dot: "bg-ems",
    badgeBg: "bg-ems/10",
    badgeText: "text-ems",
    border: "border-ems/20",
  },
  "in-progress": {
    dot: "bg-gold",
    badgeBg: "bg-gold/10",
    badgeText: "text-gold",
    border: "border-gold/20",
  },
  next: {
    dot: "bg-law",
    badgeBg: "bg-law/10",
    badgeText: "text-law",
    border: "border-law/20",
  },
  exploring: {
    dot: "bg-textHint",
    badgeBg: "bg-surfaceLight",
    badgeText: "text-textMuted",
    border: "border-borderLight",
  },
};

export const metadata = {
  title: "Roadmap | ToneOut",
  description:
    "What's shipped, what's in progress, and what's next for ToneOut. Submit your own idea.",
};

export default function RoadmapPage() {
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
          Roadmap
        </h1>
        <p className="mb-12 text-sm text-textMuted">
          What&apos;s shipped, what we&apos;re building, and what&apos;s coming.
          Have an idea? Tell us at the bottom.
        </p>

        <div className="space-y-12">
          {STATUS_ORDER.map((status) => {
            const items = roadmap.filter((item) => item.status === status);
            if (items.length === 0) return null;
            const style = statusStyles[status];
            const meta = STATUS_META[status];

            return (
              <div key={status}>
                <div className="mb-4 flex items-center gap-2.5">
                  <span
                    className={`size-2 shrink-0 rounded-full ${style.dot}`}
                    aria-hidden
                  />
                  <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-textSecondary">
                    {meta.label}
                  </h2>
                  <span className="text-[11px] text-textHint">{meta.blurb}</span>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border bg-surface px-5 py-4 text-left ${style.border}`}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-textSecondary">
                          {item.title}
                        </h3>
                        <span
                          className={`rounded-[3px] px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.1em] ${style.badgeBg} ${style.badgeText}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-textMuted">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 border-t border-surfaceLight pt-12">
          <IdeaForm />
        </div>
      </section>
    </main>
  );
}
