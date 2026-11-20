"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Person = {
  _id: string;
  email: string;
  name: string;
  role: "owner" | "admin";
  disabled: boolean;
  hasPassword: boolean;
  hasInvite: boolean;
  inviteExpiresAt?: number;
  lastLoginAt?: number;
};

const inputClass =
  "w-full rounded-md border border-borderLight bg-background px-3 py-2.5 text-base text-textPrimary placeholder:text-textHint focus:border-borderBright focus:outline-none sm:text-sm";
const smallButton =
  "rounded-md border border-borderBright px-3 py-1.5 text-xs font-semibold text-textBody transition-colors hover:text-textPrimary disabled:opacity-50";

function statusOf(
  person: Person,
  now: number,
): { label: string; color: string } {
  if (person.disabled) return { label: "Access removed", color: "text-fire" };
  if (person.role === "owner") return { label: "Owner", color: "text-gold" };
  if (person.hasPassword) return { label: "Active", color: "text-ems" };
  if (person.hasInvite && (person.inviteExpiresAt ?? 0) > now) {
    return { label: "Invited", color: "text-gold" };
  }
  return { label: "Invite expired", color: "text-textBody" };
}

export default function PeopleManager() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [now, setNow] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [invite, setInvite] = useState<{ name: string; url: string } | null>(
    null,
  );

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (!response.ok) {
      setNotice("Could not load the list.");
      return;
    }
    const data = (await response.json()) as { users: Person[]; now: number };
    setPeople(data.users);
    setNow(data.now);
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  async function post(body: Record<string, string>) {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        inviteUrl?: string;
      } | null;
      if (!response.ok) {
        setNotice(data?.error ?? "That did not work.");
        return null;
      }
      await refresh();
      return data;
    } catch {
      setNotice("That did not work. Check your connection.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function sendInvite(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const data = await post({ action: "invite", name, email });
    if (data?.inviteUrl) {
      setInvite({ name, url: data.inviteUrl });
      setName("");
      setEmail("");
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-1 text-sm font-bold text-textPrimary">
          Give someone access
        </h2>
        <p className="mb-3 text-xs leading-relaxed text-textBody">
          This makes a one-time link. Send it to them yourself by text or
          email; they open it and choose their own password.
        </p>
        <form
          onSubmit={sendInvite}
          className="space-y-3 rounded-xl border border-border bg-surface px-5 py-4"
        >
          <input
            className={inputClass}
            placeholder="Their name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className={inputClass}
            type="email"
            placeholder="Their email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button
            type="submit"
            disabled={busy || !name.trim() || !email.trim()}
            className="rounded-md bg-fire/90 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-fire disabled:opacity-50"
          >
            Create invite link
          </button>
        </form>
      </section>

      {invite && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            Invite link for {invite.name}
          </p>
          <p className="my-2 select-all break-all font-mono text-xs text-textPrimary">
            {invite.url}
          </p>
          <p className="text-xs text-textBody">
            Works once, expires in 7 days and will not be shown again.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className={smallButton}
              onClick={() => void navigator.clipboard?.writeText(invite.url)}
            >
              Copy link
            </button>
            <button
              type="button"
              className={smallButton}
              onClick={() => setInvite(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {notice && (
        <p className="rounded-lg border border-borderBright bg-surface px-4 py-3 text-xs text-textSecondary">
          {notice}
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold text-textPrimary">
          People with access
        </h2>
        {people === null ? (
          <p className="text-sm text-textBody">Loading…</p>
        ) : (
          <div className="space-y-3">
            {people.map((person) => {
              const status = statusOf(person, now);
              return (
                <article
                  key={person._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-5 py-4"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-textPrimary">
                      {person.name}
                    </h3>
                    <p className="truncate text-xs text-textBody">
                      {person.email}
                    </p>
                    <p className={`mt-1 text-xs font-semibold ${status.color}`}>
                      {status.label}
                      {person.lastLoginAt
                        ? ` · last signed in ${new Date(
                            person.lastLoginAt,
                          ).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  {person.role !== "owner" && (
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        className={smallButton}
                        onClick={() =>
                          void post({
                            action: person.disabled ? "enable" : "disable",
                            id: person._id,
                          })
                        }
                      >
                        {person.disabled ? "Restore access" : "Remove access"}
                      </button>
                      {!person.disabled && !person.hasPassword && (
                        <button
                          type="button"
                          disabled={busy}
                          className={smallButton}
                          onClick={async () => {
                            const data = await post({
                              action: "invite",
                              name: person.name,
                              email: person.email,
                            });
                            if (data?.inviteUrl) {
                              setInvite({ name: person.name, url: data.inviteUrl });
                            }
                          }}
                        >
                          New link
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
