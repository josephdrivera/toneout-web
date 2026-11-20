"use client";

import { useEffect, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ConvexClientProvider from "../ConvexClientProvider";
import AlertCard, { type PublicAlert } from "./AlertCard";
import NewsFilters, { type Filters } from "./NewsFilters";

function FeedInner() {
  const [filters, setFilters] = useState<Filters>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const { results, status, loadMore } = usePaginatedQuery(
    api.alerts.listPublished,
    filters,
    { initialNumItems: 25 },
  );

  return (
    <div>
      <div className="mb-8">
        <NewsFilters filters={filters} onChange={setFilters} />
      </div>

      {status === "LoadingFirstPage" && (
        <p className="py-12 text-center text-sm text-textMuted">
          Loading the live feed…
        </p>
      )}

      {status !== "LoadingFirstPage" && results.length === 0 && (
        <p className="py-12 text-center text-sm text-textMuted">
          No alerts match these filters yet. Check back soon — the feed
          updates automatically.
        </p>
      )}

      <div className="space-y-3">
        {(results as PublicAlert[]).map((alert) => (
          <AlertCard key={alert._id} alert={alert} now={now} />
        ))}
      </div>

      {status === "CanLoadMore" && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => loadMore(25)}
            className="rounded-md border border-borderLight px-4 py-2 text-xs font-semibold text-textMuted transition-colors hover:border-borderBright hover:text-textBody"
          >
            Load more
          </button>
        </div>
      )}
      {status === "LoadingMore" && (
        <p className="mt-8 text-center text-xs text-textHint">Loading…</p>
      )}
    </div>
  );
}

export default function NewsFeed() {
  return (
    <ConvexClientProvider>
      <FeedInner />
    </ConvexClientProvider>
  );
}
