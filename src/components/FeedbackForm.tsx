"use client";

import { FormEvent, useState } from "react";

const MAX_MESSAGE_LENGTH = 4000;

type Topic = "request" | "feedback" | "bug";
type Platform = "ios" | "android";

const TOPICS: Array<{ value: Topic; label: string }> = [
  { value: "request", label: "Request" },
  { value: "feedback", label: "Feedback" },
  { value: "bug", label: "Bug" },
];

const PLATFORMS: Array<{ value: Platform; label: string }> = [
  { value: "ios", label: "iPhone" },
  { value: "android", label: "Android" },
];

const INPUT =
  "min-h-[46px] w-full rounded-[10px] border border-[#1e1f2a] bg-surfaceLight px-3.5 text-sm text-textSecondary outline-none placeholder:text-[#3a3b4a] focus:border-accent/60";

function chip(active: boolean, disabled: boolean): string {
  return [
    "flex min-h-[40px] cursor-pointer items-center justify-center rounded-[10px] border bg-surfaceLight px-3 text-xs font-bold transition-colors",
    active ? "border-accent text-textSecondary" : "border-[#1e1f2a] text-textMuted",
    disabled ? "cursor-not-allowed opacity-60" : "",
  ].join(" ");
}

export default function FeedbackForm() {
  const [topic, setTopic] = useState<Topic>("request");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const busy = status === "loading";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please write a message first.");
      return;
    }
    if (email && (!email.includes("@") || !email.includes("."))) {
      setError("That email doesn't look right. Leave it blank if you prefer.");
      return;
    }
    setError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platform,
          message: trimmed,
          email: email.trim(),
          website,
        }),
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
      <div className="rounded-[14px] border border-ems/20 bg-surface px-8 py-7 text-center">
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
        <h3 className="mb-2 text-lg font-bold text-textPrimary">Message received</h3>
        <p className="text-[13px] leading-relaxed text-textBody">Thanks. We read every one. If you left an email, we&apos;ll write back.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-borderLight bg-surface px-6 py-6">
      <form onSubmit={handleSubmit} noValidate className="relative space-y-3">
        <fieldset className="grid grid-cols-3 gap-2">
          <legend className="sr-only">What is this about?</legend>
          {TOPICS.map((option) => (
            <label key={option.value} className={chip(topic === option.value, busy)}>
              <input
                type="radio"
                name="feedback-topic"
                value={option.value}
                checked={topic === option.value}
                onChange={() => setTopic(option.value)}
                disabled={busy}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <div>
          <label htmlFor="feedback-message" className="sr-only">
            Your message
          </label>
          <textarea
            id="feedback-message"
            placeholder="A feed, a town, a feature. What do you want to see more of?"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError("");
            }}
            disabled={busy}
            rows={5}
            maxLength={MAX_MESSAGE_LENGTH}
            className={`${INPUT} resize-y py-3`}
          />
        </div>

        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="mb-2 text-[11px] text-textHint">
            Which phone? (optional)
          </legend>
          {PLATFORMS.map((option) => (
            <label key={option.value} className={chip(platform === option.value, busy)}>
              <input
                type="checkbox"
                value={option.value}
                checked={platform === option.value}
                onChange={() =>
                  setPlatform(platform === option.value ? "" : option.value)
                }
                disabled={busy}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="feedback-email" className="sr-only">
            Email (optional)
          </label>
          <input
            id="feedback-email"
            type="email"
            autoComplete="email"
            placeholder="Email (optional, if you want a reply)"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={busy}
            className={`${INPUT} flex-1`}
          />
          <button
            type="submit"
            disabled={busy}
            className="min-h-[46px] shrink-0 rounded-[10px] bg-accent px-[22px] text-[13px] font-bold whitespace-nowrap text-white disabled:opacity-60"
          >
            {busy ? "Sending\u2026" : "Send"}
          </button>
        </div>
        {/* Honeypot: hidden from people, filled by bots. */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden={true}
          className="absolute left-[-9999px] size-px opacity-0"
        />
      </form>
      {error && (
        <p role="alert" className="mt-2 text-[11px] text-fire">
          {error}
        </p>
      )}
    </div>
  );
}
