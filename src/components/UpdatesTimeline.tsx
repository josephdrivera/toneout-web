"use client";

import { useEffect, useRef, useState } from "react";
import type { Update } from "../data/updates";
import ShareButtons from "./ShareButtons";

const tagStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  new: { bg: "bg-ems/10", text: "text-ems", dot: "bg-ems", label: "NEW" },
  improvement: { bg: "bg-law/10", text: "text-law", dot: "bg-law", label: "IMPROVEMENT" },
  fix: { bg: "bg-fire/10", text: "text-fire", dot: "bg-fire", label: "FIX" },
  announcement: { bg: "bg-gold/10", text: "text-gold", dot: "bg-gold", label: "ANNOUNCEMENT" },
};

export default function UpdatesTimeline({ updates }: { updates: Update[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const anchor = viewportH * 0.55;
      const total = rect.height;
      const scrolled = Math.min(
        Math.max(anchor - rect.top, 0),
        total
      );
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      setProgress(pct);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative pl-10 sm:pl-12">
      {/* Base track */}
      <div
        className="pointer-events-none absolute left-[15px] top-2 bottom-2 w-px bg-borderBright sm:left-[19px]"
        aria-hidden
      />

      {/* Traced progress line */}
      <div
        className="pointer-events-none absolute left-[15px] top-2 w-px bg-gradient-to-b from-accent/80 via-accent/60 to-accent/0 transition-[height] duration-150 ease-out sm:left-[19px]"
        style={{ height: `${progress}%` }}
        aria-hidden
      />

      <div className="space-y-6">
        {updates.map((update, index) => {
          const tag = update.tag ? tagStyles[update.tag] : null;
          const isActive = progress > (index / updates.length) * 100;

          return (
            <article
              key={update.id}
              id={update.id}
              className="relative"
            >
              {/* Dot marker */}
              <div
                className="absolute -left-[38px] top-[4px] flex size-[14px] items-center justify-center sm:-left-[46px]"
                aria-hidden
              >
                <span
                  className={`absolute size-[14px] rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-accent/20 scale-100"
                      : "bg-transparent scale-75"
                  }`}
                />
                <span
                  className={`relative size-[7px] rounded-full transition-colors duration-300 ${
                    isActive
                      ? "bg-accent shadow-[0_0_8px_rgba(72,120,168,0.6)]"
                      : "bg-borderBright"
                  }`}
                />
              </div>

              {/* Date label next to dot */}
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
                  {update.body}
                </p>
                <ShareButtons title={update.title} id={update.id} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
