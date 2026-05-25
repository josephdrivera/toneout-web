"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NetworkStatusIndicator from "./NetworkStatusIndicator";

const links = [
  { href: "/updates", label: "Updates" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
] as const;

const NODE_STATUS_URL = "https://feeds.toneout.app/";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/92 backdrop-blur-xl"
      aria-label="Main"
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fire to-law">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M2 12h4l3-9 4 18 3-9h4" />
            </svg>
          </div>
          <span className="text-[17px] font-bold text-textPrimary tracking-tight">
            ToneOut
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                    isActive
                      ? "border-borderBright bg-borderBright text-textSecondary"
                      : "border-transparent bg-transparent text-textMuted",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <a
            href={NODE_STATUS_URL}
            rel="noopener"
            title="ToneOut Network node status"
            className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1.5 text-xs font-medium text-textMuted transition-colors hover:text-textBody"
          >
            ToneOut Node
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

          <NetworkStatusIndicator />
        </div>
      </div>
    </nav>
  );
}
