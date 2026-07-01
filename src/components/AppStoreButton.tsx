import { APP_STORE_URL } from "../lib/links";

export default function AppStoreButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener"
      className={[
        "inline-flex items-center gap-3 rounded-xl border border-borderBright bg-gradient-to-b from-[#1a1b26] to-[#101119] px-6 py-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-colors hover:border-accent/40",
        className,
      ].join(" ")}
      aria-label="Download ToneOut on the App Store"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-textPrimary"
        aria-hidden={true}
      >
        <path d="M17.05 12.54c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.44-.36 6.05 1.01 8.03.67.97 1.47 2.06 2.51 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.99 2.44-1.96.77-1.12 1.09-2.21 1.11-2.27-.02-.01-2.13-.82-2.15-3.25zM15.03 6.6c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.98 1.56-.86 2.48.9.07 1.83-.46 2.4-1.13z" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-medium tracking-[0.04em] text-textMuted">
          Download on the
        </span>
        <span className="text-lg font-bold text-textPrimary">App Store</span>
      </span>
    </a>
  );
}
