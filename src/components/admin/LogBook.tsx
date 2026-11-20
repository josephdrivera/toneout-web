"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Entry = {
  _id: string;
  date: string;
  area: string;
  title: string;
  body: string;
  author: string;
};

const AREAS = [
  "General",
  "Website",
  "iPhone app",
  "Android app",
  "Node 01",
  "Cloud hub",
  "Node kit",
  "Admin",
  "Planning",
];

const inputClass =
  "w-full rounded-md border border-borderLight bg-background px-3 py-2.5 text-base text-textPrimary placeholder:text-textHint focus:border-borderBright focus:outline-none sm:text-sm";
const smallButton =
  "rounded-md border border-borderBright px-3 py-1.5 text-xs font-semibold text-textBody transition-colors hover:text-textPrimary disabled:opacity-50";

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function prettyDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function LogBook() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [area, setArea] = useState("All");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: "",
    area: "General",
    title: "",
    body: "",
  });

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/log", { cache: "no-store" });
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (!response.ok) {
      setNotice("Could not load the log.");
      return;
    }
    const data = (await response.json()) as {
      entries: Entry[];
      isOwner: boolean;
    };
    setEntries(data.entries);
    setIsOwner(data.isOwner);
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  async function post(body: Record<string, string>) {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setNotice(data?.error ?? "That did not work.");
        return false;
      }
      await refresh();
      return true;
    } catch {
      setNotice("That did not work. Check your connection.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addEntry(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const ok = await post({ action: "add", ...form });
    if (ok) {
      setAdding(false);
      setForm({ date: "", area: "General", title: "", body: "" });
    }
  }

  const areas = useMemo(() => {
    const seen = new Set<string>();
    for (const entry of entries ?? []) seen.add(entry.area);
    return ["All", ...Array.from(seen).sort()];
  }, [entries]);

  const days = useMemo(() => {
    const shown = (entries ?? []).filter(
      (entry) => area === "All" || entry.area === area,
    );
    const grouped: Array<{ date: string; items: Entry[] }> = [];
    for (const entry of shown) {
      const last = grouped[grouped.length - 1];
      if (last && last.date === entry.date) last.items.push(entry);
      else grouped.push({ date: entry.date, items: [entry] });
    }
    return grouped;
  }, [entries, area]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-[520px]">
          <h2 className="text-sm font-bold text-textPrimary">Project log</h2>
          <p className="mt-1 text-xs leading-relaxed text-textBody">
            What was done and when, newest first. Never put passwords or keys
            here: everyone with admin access can read it.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a href="/api/admin/log/download" className={smallButton}>
            Download
          </a>
          {!adding && (
            <button
              type="button"
              onClick={() => {
                setForm((current) => ({ ...current, date: today() }));
                setAdding(true);
              }}
              className="rounded-md bg-fire/90 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-fire"
            >
              Add entry
            </button>
          )}
        </div>
      </div>

      {adding && (
        <form
          onSubmit={addEntry}
          className="space-y-3 rounded-xl border border-borderBright bg-surface px-5 py-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              className={inputClass}
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
            <select
              className={inputClass}
              value={form.area}
              onChange={(event) => setForm({ ...form, area: event.target.value })}
            >
              {AREAS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <input
            className={inputClass}
            placeholder="What happened, in a few words"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <textarea
            className={`${inputClass} min-h-[120px]`}
            placeholder="The details. No passwords or keys."
            value={form.body}
            onChange={(event) => setForm({ ...form, body: event.target.value })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || !form.title.trim() || !form.body.trim()}
              className="rounded-md bg-fire/90 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-fire disabled:opacity-50"
            >
              Save entry
            </button>
            <button
              type="button"
              className={smallButton}
              onClick={() => setAdding(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {notice && (
        <p className="rounded-lg border border-borderBright bg-surface px-4 py-3 text-xs text-textSecondary">
          {notice}
        </p>
      )}

      {areas.length > 2 && (
        <div className="flex flex-wrap gap-1.5">
          {areas.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setArea(option)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                area === option
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-borderBright text-textBody hover:text-textPrimary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {entries === null ? (
        <p className="text-sm text-textBody">Loading the log…</p>
      ) : days.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-5 py-6 text-sm text-textBody">
          Nothing logged yet.
        </p>
      ) : (
        <div className="space-y-8">
          {days.map((day) => (
            <section key={day.date}>
              <h3 className="mb-3 border-b border-border pb-2 text-xs font-bold uppercase tracking-wide text-gold">
                {prettyDate(day.date)}
              </h3>
              <div className="space-y-3">
                {day.items.map((entry) => (
                  <article
                    key={entry._id}
                    className="rounded-xl border border-border bg-surface px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold text-textPrimary">
                        {entry.title}
                      </h4>
                      <span className="shrink-0 rounded-full border border-borderBright px-2 py-0.5 text-[10px] font-semibold text-textBody">
                        {entry.area}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line break-words text-xs leading-relaxed text-textSecondary">
                      {entry.body}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[11px] text-textMuted">
                        Logged by {entry.author}
                      </p>
                      {isOwner && (
                        <button
                          type="button"
                          disabled={busy}
                          className="text-[11px] text-textMuted hover:text-fire"
                          onClick={() => {
                            if (window.confirm("Delete this log entry?")) {
                              void post({ action: "delete", id: entry._id });
                            }
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
