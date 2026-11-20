"use client";

import { FormEvent, useState } from "react";

const INPUT =
  "min-h-[46px] w-full rounded-[10px] border border-[#1e1f2a] bg-surfaceLight px-3.5 text-sm text-textSecondary outline-none placeholder:text-[#3a3b4a] focus:border-accent/60";

const EMPTY = {
  name: "",
  role: "",
  department: "",
  town: "",
  email: "",
  phone: "",
  message: "",
};

type Field = keyof typeof EMPTY;
type HostType = "firehouse" | "home";

const HOST_TYPES: Array<{ value: HostType; label: string }> = [
  { value: "firehouse", label: "At our firehouse" },
  { value: "home", label: "At my home" },
];

export default function DemoRequestForm() {
  const [hostType, setHostType] = useState<HostType>("firehouse");
  const [values, setValues] = useState(EMPTY);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const busy = status === "loading";

  function input(
    name: Field,
    label: string,
    options: { type?: string; autoComplete?: string; placeholder?: string } = {},
  ) {
    return (
      <div>
        <label
          htmlFor={`demo-${name}`}
          className="mb-1.5 block text-[11px] font-semibold text-textMuted"
        >
          {label}
        </label>
        <input
          id={`demo-${name}`}
          type={options.type ?? "text"}
          autoComplete={options.autoComplete}
          placeholder={options.placeholder}
          value={values[name]}
          onChange={(e) => {
            setValues({ ...values, [name]: e.target.value });
            setError("");
          }}
          disabled={busy}
          maxLength={120}
          className={INPUT}
        />
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!values.name.trim() || !values.town.trim()) {
      setError("Please fill in your name and town.");
      return;
    }
    if (hostType === "firehouse" && !values.department.trim()) {
      setError("Please tell us which fire department.");
      return;
    }
    if (!values.email.includes("@") || !values.email.includes(".")) {
      setError("Please enter a valid email so we can reach you.");
      return;
    }
    setError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, hostType, website }),
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
        <h3 className="mb-2 text-lg font-bold text-textPrimary">Request received</h3>
        <p className="text-[13px] leading-relaxed text-textBody">Thanks. We&apos;ll email you about hosting a ToneOut node.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-borderLight bg-surface px-6 py-6">
      <form onSubmit={handleSubmit} noValidate className="relative space-y-3">
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="mb-2 text-[11px] font-semibold text-textMuted">
            Where would the node go?
          </legend>
          {HOST_TYPES.map((option) => (
            <label
              key={option.value}
              className={[
                "flex min-h-[40px] cursor-pointer items-center justify-center rounded-[10px] border bg-surfaceLight px-3 text-xs font-bold transition-colors",
                hostType === option.value
                  ? "border-accent text-textSecondary"
                  : "border-[#1e1f2a] text-textMuted",
                busy ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              <input
                type="radio"
                name="demo-host-type"
                value={option.value}
                checked={hostType === option.value}
                onChange={() => {
                  setHostType(option.value);
                  setError("");
                }}
                disabled={busy}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          {input("name", "Your name", { autoComplete: "name" })}
          {input("role", "Rank or role (optional)", {
            placeholder: "Chief, officer, member",
          })}
          {input(
            "department",
            hostType === "home"
              ? "Nearest fire or police department (optional)"
              : "Fire department",
            { autoComplete: "organization" },
          )}
          {input("town", "Town and state", { placeholder: "Glastonbury, CT" })}
          {input("email", "Email", { type: "email", autoComplete: "email" })}
          {input("phone", "Phone (optional)", {
            type: "tel",
            autoComplete: "tel",
          })}
        </div>
        <div>
          <label
            htmlFor="demo-message"
            className="mb-1.5 block text-[11px] font-semibold text-textMuted"
          >
            Anything we should know? (optional)
          </label>
          <textarea
            id="demo-message"
            placeholder={
              hostType === "home"
                ? "How close you are to a station or tower, questions"
                : "How you're paged today, how many members, questions"
            }
            value={values.message}
            onChange={(e) => {
              setValues({ ...values, message: e.target.value });
              setError("");
            }}
            disabled={busy}
            rows={4}
            maxLength={2000}
            className={`${INPUT} resize-y py-3`}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="min-h-[46px] w-full rounded-[10px] bg-fire px-[22px] text-[13px] font-bold text-white disabled:opacity-60"
        >
          {busy ? "Sending\u2026" : "Ask About a Node"}
        </button>
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
