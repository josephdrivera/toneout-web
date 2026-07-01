"use client";

import { FormEvent, useState } from "react";

const MAX_IDEA_LENGTH = 2000;

export default function IdeaForm() {
  const [idea, setIdea] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = idea.trim();
    if (!trimmed) {
      setError("Please describe your idea first.");
      return;
    }
    if (trimmed.length > MAX_IDEA_LENGTH) {
      setError("That's a bit long — please keep it under 2000 characters.");
      return;
    }
    if (email && (!email.includes("@") || !email.includes("."))) {
      setError("That email doesn't look right. Leave it blank if you prefer.");
      return;
    }
    setError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/roadmap-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed, email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      setStatus("success");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-[440px] rounded-[14px] border border-ems/20 bg-surface px-8 py-7 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-ems/10">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4d8a5c"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden={true}
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-textPrimary">
          Idea received
        </h3>
        <p className="text-[13px] leading-relaxed text-textBody">
          Thanks — we read every submission. Good ideas shape the roadmap.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[440px] rounded-[14px] border border-borderLight bg-surface px-6 py-7">
      <h3 className="mb-1.5 text-center text-base font-bold text-textSecondary">
        Have an idea?
      </h3>
      <p className="mb-5 text-center text-xs leading-normal text-textMuted">
        Tell us what you&apos;d want ToneOut to do. Feature requests, feeds,
        anything — it goes straight to us.
      </p>
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div>
          <label htmlFor="idea-text" className="sr-only">
            Your idea
          </label>
          <textarea
            id="idea-text"
            placeholder="I'd love it if ToneOut could…"
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value);
              setError("");
            }}
            disabled={status === "loading"}
            rows={4}
            maxLength={MAX_IDEA_LENGTH}
            className={[
              "w-full resize-y rounded-[10px] border bg-surfaceLight px-3.5 py-3 text-sm text-textSecondary outline-none placeholder:text-[#3a3b4a]",
              error ? "border-fire/25" : "border-[#1e1f2a]",
            ].join(" ")}
          />
        </div>
        <div className="flex gap-2">
          <label htmlFor="idea-email" className="sr-only">
            Email (optional)
          </label>
          <input
            id="idea-email"
            type="email"
            placeholder="Email (optional, if you want a reply)"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={status === "loading"}
            className="min-h-[46px] flex-1 rounded-[10px] border border-[#1e1f2a] bg-surfaceLight px-3.5 text-sm text-textSecondary outline-none placeholder:text-[#3a3b4a]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-[10px] bg-accent px-[22px] text-[13px] font-bold whitespace-nowrap text-white disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
      {error && <p className="mt-2 text-[11px] text-fire">{error}</p>}
    </div>
  );
}
