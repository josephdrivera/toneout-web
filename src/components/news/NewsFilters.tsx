"use client";

import {
  CATEGORIES,
  CATEGORY_LABELS,
  VERIFICATION_LABELS,
  VERIFICATION_LEVELS,
  type Category,
  type Verification,
} from "../../../convex/lib/taxonomy";

export type Filters = {
  state?: string;
  category?: Category;
  verification?: Verification;
};

const STATES = ["CT"] as const;

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors",
        active
          ? "border-borderBright bg-borderBright text-textSecondary"
          : "border-borderLight bg-transparent text-textMuted hover:text-textBody",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function NewsFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-16 text-[10px] font-bold uppercase tracking-[0.12em] text-textHint">
          State
        </span>
        <Pill
          active={!filters.state}
          onClick={() => onChange({ ...filters, state: undefined })}
        >
          All
        </Pill>
        {STATES.map((state) => (
          <Pill
            key={state}
            active={filters.state === state}
            onClick={() => onChange({ ...filters, state })}
          >
            {state}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-16 text-[10px] font-bold uppercase tracking-[0.12em] text-textHint">
          Category
        </span>
        <Pill
          active={!filters.category}
          onClick={() => onChange({ ...filters, category: undefined })}
        >
          All
        </Pill>
        {CATEGORIES.map((category) => (
          <Pill
            key={category}
            active={filters.category === category}
            onClick={() => onChange({ ...filters, category })}
          >
            {CATEGORY_LABELS[category]}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-16 text-[10px] font-bold uppercase tracking-[0.12em] text-textHint">
          Status
        </span>
        <Pill
          active={!filters.verification}
          onClick={() => onChange({ ...filters, verification: undefined })}
        >
          All
        </Pill>
        {VERIFICATION_LEVELS.map((verification) => (
          <Pill
            key={verification}
            active={filters.verification === verification}
            onClick={() => onChange({ ...filters, verification })}
          >
            {VERIFICATION_LABELS[verification]}
          </Pill>
        ))}
      </div>
    </div>
  );
}
