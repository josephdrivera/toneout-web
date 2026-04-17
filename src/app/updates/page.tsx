import Link from "next/link";
import { updates } from "../../data/updates";
import UpdatesTimeline from "../../components/UpdatesTimeline";

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
        <p className="mb-12 text-sm text-textMuted">
          Development progress, new features, and announcements.
        </p>

        <UpdatesTimeline updates={updates} />
      </section>
    </main>
  );
}
