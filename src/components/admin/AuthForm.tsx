"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "login" | "setup" | "invite";

const inputClass =
  "mb-3 w-full rounded-md border border-borderLight bg-background px-3 py-2.5 text-base text-textPrimary placeholder:text-textHint focus:border-borderBright focus:outline-none sm:text-sm";

const COPY: Record<Mode, { title: string; intro: string; button: string }> = {
  login: {
    title: "Network Admin",
    intro: "Sign in to manage ToneOut nodes.",
    button: "Sign in",
  },
  setup: {
    title: "Set up Network Admin",
    intro:
      "First time here. Create the owner account. You need the editor password to prove this is your site.",
    button: "Create owner account",
  },
  invite: {
    title: "You're invited",
    intro: "Choose a password to finish setting up your admin account.",
    button: "Set password",
  },
};

export default function AuthForm({
  mode,
  token = "",
}: {
  mode: Mode;
  token?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

  // On the login page, point a first-time owner at setup.
  useEffect(() => {
    if (mode !== "login") return;
    let cancelled = false;
    fetch("/api/admin/setup", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { open?: boolean } | null) => {
        if (!cancelled && data?.open) setSetupOpen(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [mode]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const request =
      mode === "login"
        ? { url: "/api/admin/login", body: { email, password } }
        : mode === "setup"
          ? {
              url: "/api/admin/setup",
              body: { setupPassword, name, email, password },
            }
          : { url: "/api/admin/invite", body: { token, password } };
    try {
      const response = await fetch(request.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.body),
      });
      if (response.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "That did not work. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const copy = COPY[mode];
  const missingToken = mode === "invite" && !token;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 text-textSecondary">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-border bg-surface px-6 py-7"
      >
        <h1 className="mb-1 text-lg font-bold text-textPrimary">{copy.title}</h1>
        <p className="mb-5 text-xs leading-relaxed text-textBody">
          {missingToken
            ? "This invite link is incomplete. Ask for a new one."
            : copy.intro}
        </p>

        {mode === "setup" && (
          <>
            <input
              type="password"
              value={setupPassword}
              onChange={(event) => setSetupPassword(event.target.value)}
              placeholder="Editor password"
              autoComplete="off"
              className={inputClass}
            />
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className={inputClass}
            />
          </>
        )}
        {mode !== "invite" && (
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            autoComplete="username"
            className={inputClass}
          />
        )}
        {!missingToken && (
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={
              mode === "login" ? "Password" : "New password (10+ characters)"
            }
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={inputClass}
          />
        )}

        {error && <p className="mb-3 text-xs text-fire">{error}</p>}

        {!missingToken && (
          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full rounded-md bg-fire/90 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-fire disabled:opacity-50"
          >
            {submitting ? "Working…" : copy.button}
          </button>
        )}

        {mode === "login" && setupOpen && (
          <p className="mt-4 text-center text-xs text-textBody">
            No admin account exists yet.{" "}
            <Link href="/admin/setup" className="text-gold hover:underline">
              Set it up
            </Link>
          </p>
        )}
        {mode !== "login" && (
          <p className="mt-4 text-center text-xs text-textMuted">
            <Link href="/admin/login" className="hover:text-textBody">
              Back to sign in
            </Link>
          </p>
        )}
      </form>
    </main>
  );
}
