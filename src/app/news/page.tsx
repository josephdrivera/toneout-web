import Link from "next/link";
import NewsFeed from "../../components/news/NewsFeed";
import SourceStatus from "../../components/news/SourceStatus";

export const metadata = {
  title: "Fire Service News & Alerts | ToneOut",
  description:
    "A continuously updating feed of fire service news and alerts: incidents, training, personnel, apparatus, and department updates from approved public sources. Connecticut sources coming soon.",
};

export default function NewsPage() {
  return (
    <main className="relative bg-background pt-20 text-textSecondary">
      <div
        className="pointer-events-none absolute left-1/2 top-[60px] size-[400px] -translate-x-1/2 rounded-full opacity-[0.04] [background:radial-gradient(circle,#bf5a3a_0%,transparent_70%)]"
        aria-hidden
      />

      <section className="relative mx-auto max-w-[680px] px-6 pt-12 pb-20">
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
          Fire Service News
        </h1>
        <p className="mb-3 text-sm text-textMuted">
          A live feed of fire service news: incidents, training, personnel
          moves, apparatus, and department updates, collected automatically
          from approved public sources. It updates by itself all day.
          Connecticut sources are coming soon.
        </p>
        <p className="mb-10 rounded-lg border border-borderLight bg-surface px-4 py-3 text-xs leading-relaxed text-textHint">
          Automated alerts are machine-published from approved sources and
          link to the original report — they do not imply independent
          confirmation. Items marked{" "}
          <span className="font-semibold text-ems">Editorially Verified</span>{" "}
          or{" "}
          <span className="font-semibold text-ems">Confirmed by Department</span>{" "}
          have been reviewed by a human. ToneOut News is not an emergency
          service — always call 911.
        </p>

        <SourceStatus />
        <NewsFeed />
      </section>
    </main>
  );
}
