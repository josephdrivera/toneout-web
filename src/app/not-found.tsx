import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center bg-background px-6 pt-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-borderBright bg-surface">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#50515f"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden={true}
        >
          <path d="M2 12h4l3-9 4 18 3-9h4" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-textPrimary">
        Page not found
      </h1>
      <p className="mt-2 max-w-xs text-sm text-textMuted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  );
}
