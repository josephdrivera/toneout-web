"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ConvexClientProvider from "../ConvexClientProvider";

function Inner() {
  const sources = useQuery(api.sources.listPublicStatus, {});
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mb-8 rounded-lg border border-borderLight bg-surface px-4 py-3">
      <p className="mb-2.5 text-[10px] font-bold tracking-[0.1em] text-textHint">
        SOURCES
      </p>
      <ul className="flex flex-wrap gap-2">
        {sources.map((source) => {
          const live = source.status === "live";
          return (
            <li
              key={source.name}
              className={[
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold",
                live
                  ? "border-ems/20 bg-ems/[0.08] text-textBody"
                  : "border-borderLight text-textHint",
              ].join(" ")}
            >
              <span
                className={[
                  "size-1.5 shrink-0 rounded-full",
                  live ? "bg-ems" : "bg-textHint/50",
                ].join(" ")}
                aria-hidden
              />
              {source.name}
              <span className={live ? "text-ems" : "text-textHint"}>
                {live ? "Live" : "Coming soon"}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2.5 text-[11px] leading-relaxed text-textHint">
        We&apos;re working on the sources marked coming soon, and on adding
        more.
      </p>
    </div>
  );
}

export default function SourceStatus() {
  return (
    <ConvexClientProvider>
      <Inner />
    </ConvexClientProvider>
  );
}
