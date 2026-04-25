"use client";

import { FormEvent, useState } from "react";

type Platform = "ios" | "android";

const PLATFORM_OPTIONS: Array<{ value: Platform; label: string }> = [
  { value: "ios", label: "iPhone (iOS)" },
  { value: "android", label: "Android" },
];

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!platform) {
      setError("Please choose iPhone (iOS) or Android.");
      return;
    }
    setError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      setStatus(data.alreadyJoined ? "already" : "success");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "already") {
    return (
      <div className="mx-auto max-w-[440px] rounded-[14px] border border-accent/20 bg-surface px-8 py-7 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-accent/10">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4878a8"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden={true}
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-textPrimary">
          You&apos;re already on the list
        </h3>
        <p className="text-[13px] leading-relaxed text-textBody">
          We already have your email. We&apos;ll notify you when ToneOut
          launches. No need to sign up again.
        </p>
      </div>
    );
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
          You&apos;re on the list
        </h3>
        <p className="text-[13px] leading-relaxed text-textBody">
          We&apos;ll notify you as soon as ToneOut is available. No spam, just
          one email when we launch.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[440px] rounded-[14px] border border-borderLight bg-surface px-6 py-7">
      <h3 className="mb-1.5 text-center text-base font-bold text-textSecondary">
        Get Early Access
      </h3>
      <p className="mb-5 text-center text-xs leading-normal text-textMuted">
        Be the first to know when ToneOut launches. No spam, just one email.
      </p>
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div className="flex gap-2">
          <label htmlFor="waitlist-email" className="sr-only">
            Email address
          </label>
          <input
            id="waitlist-email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={status === "loading"}
            className={[
              "min-h-[46px] flex-1 rounded-[10px] border bg-surfaceLight px-3.5 text-sm text-textSecondary outline-none placeholder:text-[#3a3b4a]",
              error ? "border-fire/25" : "border-[#1e1f2a]",
            ].join(" ")}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-[10px] bg-accent px-[22px] text-[13px] font-bold whitespace-nowrap text-white disabled:opacity-60"
          >
            {status === "loading" ? "Joining\u2026" : "Join Waitlist"}
          </button>
        </div>
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="sr-only">Choose your phone platform</legend>
          {PLATFORM_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                "flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] border bg-surfaceLight px-3 text-xs font-bold text-textMuted transition-colors",
                platform === option.value
                  ? "border-accent text-textSecondary"
                  : "border-[#1e1f2a]",
                status === "loading" ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              <input
                type="radio"
                name="platform"
                value={option.value}
                checked={platform === option.value}
                onChange={() => {
                  setPlatform(option.value);
                  setError("");
                }}
                disabled={status === "loading"}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      </form>
      {error && <p className="mt-2 text-[11px] text-fire">{error}</p>}
      <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-textHint">
        <span className="flex items-center gap-1">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden={true}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          No spam
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden={true}
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Unsubscribe anytime
        </span>
      </div>
    </div>
  );
}
