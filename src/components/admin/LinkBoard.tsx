"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LinkRow = {
  _id: string;
  group: string;
  label: string;
  url: string;
  note?: string;
};

const inputClass =
  "w-full rounded-md border border-borderLight bg-background px-3 py-2.5 text-base text-textPrimary placeholder:text-textHint focus:border-borderBright focus:outline-none sm:text-sm";
const smallButton =
  "rounded-md border border-borderBright px-3 py-1.5 text-xs font-semibold text-textBody transition-colors hover:text-textPrimary disabled:opacity-50";

function host(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function LinkBoard() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkRow[] | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({ group: "", label: "", url: "", note: "" });

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/links", { cache: "no-store" });
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (!response.ok) {
      setNotice("Could not load the links.");
      return;
    }
    const data = (await response.json()) as {
      links: LinkRow[];
      isOwner: boolean;
    };
    setLinks(data.links);
    setIsOwner(data.isOwner);
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  async function post(body: Record<string, string>) {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/links", {
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

  async function addLink(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const ok = await post({ action: "add", ...form });
    if (ok) {
      setAdding(false);
      setForm({ group: "", label: "", url: "", note: "" });
    }
  }

  const groups = useMemo(() => {
    const grouped: Array<{ group: string; items: LinkRow[] }> = [];
    for (const link of links ?? []) {
      const existing = grouped.find((entry) => entry.group === link.group);
      if (existing) existing.items.push(link);
      else grouped.push({ group: link.group, items: [link] });
    }
    return grouped;
  }, [links]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-[520px]">
          <h2 className="text-sm font-bold text-textPrimary">
            Where everything lives
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-textBody">
            Every place you need to go to update or check ToneOut. Each one
            has its own sign-in; no passwords are kept here.
          </p>
        </div>
        {isOwner && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="shrink-0 rounded-md bg-fire/90 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-fire"
          >
            Add link
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={addLink}
          className="space-y-3 rounded-xl border border-borderBright bg-surface px-5 py-4"
        >
          <input
            className={inputClass}
            placeholder="Group, e.g. Apps"
            list="link-groups"
            value={form.group}
            onChange={(event) => setForm({ ...form, group: event.target.value })}
          />
          <datalist id="link-groups">
            {groups.map((entry) => (
              <option key={entry.group} value={entry.group} />
            ))}
          </datalist>
          <input
            className={inputClass}
            placeholder="Name"
            value={form.label}
            onChange={(event) => setForm({ ...form, label: event.target.value })}
          />
          <input
            className={inputClass}
            type="url"
            placeholder="https://…"
            value={form.url}
            onChange={(event) => setForm({ ...form, url: event.target.value })}
          />
          <input
            className={inputClass}
            placeholder="What it's for, optional"
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || !form.label.trim() || !form.url.trim()}
              className="rounded-md bg-fire/90 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-fire disabled:opacity-50"
            >
              Save link
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

      {links === null ? (
        <p className="text-sm text-textBody">Loading the links…</p>
      ) : groups.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-5 py-6 text-sm text-textBody">
          No links yet.
        </p>
      ) : (
        groups.map((entry) => (
          <section key={entry.group}>
            <h3 className="mb-3 border-b border-border pb-2 text-xs font-bold uppercase tracking-wide text-gold">
              {entry.group}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {entry.items.map((link) => (
                <article
                  key={link._id}
                  className="rounded-xl border border-border bg-surface px-5 py-4"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-textPrimary hover:text-accent"
                  >
                    {link.label} ↗
                  </a>
                  <p className="mt-0.5 truncate text-[11px] text-textMuted">
                    {host(link.url)}
                  </p>
                  {link.note && (
                    <p className="mt-2 text-xs leading-relaxed text-textBody">
                      {link.note}
                    </p>
                  )}
                  {isOwner && (
                    <button
                      type="button"
                      disabled={busy}
                      className="mt-2 text-[11px] text-textMuted hover:text-fire"
                      onClick={() => {
                        if (window.confirm("Remove this link?")) {
                          void post({ action: "delete", id: link._id });
                        }
                      }}
                    >
                      Remove
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
