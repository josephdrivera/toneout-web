import { PLAY_STORE_URL } from "../lib/links";

export default function GooglePlayButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener"
      className={[
        "inline-flex items-center gap-3 rounded-xl border border-borderBright bg-gradient-to-b from-[#1a1b26] to-[#101119] px-6 py-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-colors hover:border-accent/40",
        className,
      ].join(" ")}
      aria-label="Get ToneOut on Google Play"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-textPrimary"
        aria-hidden={true}
      >
        <path d="M4.2 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l9.3-9.7-9.3-9.7zm10.4 10.8l2.6 2.7-10.9 6.2 8.3-8.9zm3.9-3.4l2.9 1.6c.9.5.9 1.4 0 1.9l-2.9 1.6-2.9-2.8 2.9-2.3zM6.3 2l10.9 6.2-2.6 2.7L6.3 2z" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-medium tracking-[0.04em] text-textMuted">
          Get it on
        </span>
        <span className="text-lg font-bold text-textPrimary">Google Play</span>
      </span>
    </a>
  );
}
