"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditorLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!password || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/editor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        router.push("/editor");
        router.refresh();
        return;
      }
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Login failed.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 text-textSecondary">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs rounded-xl border border-border bg-surface px-6 py-7"
      >
        <h1 className="mb-1 text-lg font-bold text-textPrimary">
          Editor Access
        </h1>
        <p className="mb-5 text-xs text-textMuted">
          Enter the editor password to open the review queue.
        </p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoFocus
          className="mb-3 w-full rounded-md border border-borderLight bg-background px-3 py-2 text-sm text-textPrimary placeholder:text-textHint focus:border-borderBright focus:outline-none"
        />
        {error && <p className="mb-3 text-xs text-fire">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full rounded-md bg-fire/90 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-fire disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
