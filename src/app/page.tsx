import Link from "next/link";
import WaitlistForm from "../components/WaitlistForm";
import { updates } from "../data/updates";

const features = [
  {
    paths: <path d="M2 12h4l3-9 4 18 3-9h4" />,
    iconBg: "bg-fire/10 text-fire",
    title: "Dual Listen",
    desc: "Monitor two live feeds simultaneously with independent volume controls.",
    pro: true,
  },
  {
    paths: (
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
    ),
    iconBg: "bg-law/10 text-law",
    title: "Live Feeds",
    desc: "Thousands of police, fire, and EMS dispatch feeds across the US.",
  },
  {
    paths: (
      <>
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <path d="M12 19v4M8 23h8" />
      </>
    ),
    iconBg: "bg-gold/10 text-gold",
    title: "Push to Talk",
    desc: "Walkie-talkie style communication with your crew. Map it to your iPhone\u2019s Action Button for instant transmission. Powered by Apple\u2019s PushToTalk framework.",
    pro: true,
    comingSoon: true,
    goldBorder: true,
  },
  {
    paths: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    iconBg: "bg-ems/10 text-ems",
    title: "Local Search",
    desc: "Find feeds near you by GPS or zip code. Browse by county and service type.",
  },
  {
    paths: (
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    ),
    iconBg: "bg-[#7a6b8a]/10 text-[#7a6b8a]",
    title: "Save Frequencies",
    desc: "Bookmark feeds and manually add custom frequencies for quick access.",
  },
  {
    paths: <path d="M18 6L6 18M6 6l12 12" />,
    iconBg: "bg-[#8a7b5a]/10 text-[#8a7b5a]",
    title: "No Ads. Period.",
    desc: "No banner ads, no popups, no audio interruptions. A clean tool for serious listeners.",
  },
  {
    paths: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    iconBg: "bg-[#5a7a8a]/10 text-[#5a7a8a]",
    title: "Background Audio",
    desc: "Keep listening while using other apps. Lock Screen and Control Center playback.",
    pro: true,
    comingSoon: true,
  },
  {
    paths: (
      <>
        <path d="M4.18 12.25L2 12l2.18-.25a10 10 0 018.07-8.07L12.5 2l.25 2.18a10 10 0 018.07 8.07L22 12l-2.18.25a10 10 0 01-8.07 8.07L12.5 22l-.25-2.18a10 10 0 01-8.07-8.07z" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    iconBg: "bg-law/10 text-law",
    title: "Powered by OpenMHz",
    desc: "Live audio streams sourced from OpenMHz \u2014 an open-source platform for streaming and archiving public safety radio communications.",
    link: "https://openmhz.com/",
  },
];

const roadmapItems = [
  {
    paths: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="3" fill="none" />
        <path d="M12 6v4" />
        <circle cx="12" cy="7" r="0.5" fill="currentColor" />
      </>
    ),
    title: "Action Button",
    desc: "One press to transmit",
  },
  {
    paths: (
      <>
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
      </>
    ),
    title: "Push to Talk",
    desc: "Works from Lock Screen",
  },
  {
    paths: (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </>
    ),
    title: "Contacts & Groups",
    desc: "Save your crew",
  },
  {
    paths: (
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    ),
    title: "Channels",
    desc: "Organize by team",
  },
];

export default function Home() {
  return (
    <main className="relative bg-background pt-20 text-center text-textSecondary">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-[60px] size-[500px] -translate-x-1/2 rounded-full opacity-[0.05] [background:radial-gradient(circle,#4878a8_0%,transparent_70%)]"
          aria-hidden={true}
        />

        {/* ── Hero ── */}
        <section className="relative px-6 pt-[60px]">
          {/* App icon */}
          <div className="mx-auto mb-7 flex size-20 items-center justify-center rounded-[20px] border border-borderBright bg-gradient-to-br from-[#12131a] to-[#1a1b26] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#bf5a3a"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden={true}
            >
              <path d="M2 12h4l3-9 4 18 3-9h4" />
            </svg>
          </div>

          {/* Update badge */}
          {updates.length > 0 && (
            <Link
              href="/updates"
              className="group mb-3 inline-flex items-center gap-2 rounded-full border border-accent/[0.15] bg-accent/[0.06] px-4 py-[6px] transition-all hover:border-accent/25 hover:bg-accent/10"
            >
              <span className="flex size-[18px] items-center justify-center rounded-full bg-accent/20">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4878a8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </span>
              <span className="text-[11px] font-bold tracking-[0.04em] text-accent">
                Update: {updates[0].title}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4878a8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-70"
                aria-hidden
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          {/* Coming soon badge */}
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-fire/[0.15] bg-fire/[0.07] px-3.5 py-[5px]">
            <span
              className="size-1.5 shrink-0 rounded-full bg-fire pulse-dot"
              aria-hidden={true}
            />
            <span className="text-[11px] font-bold tracking-[0.06em] text-fire">
              COMING SOON
            </span>
          </div>

          <h1 className="mb-4 text-[44px] font-extrabold leading-[1.1] tracking-[-1.5px] text-textPrimary">
            ToneOut
          </h1>

          <p className="mx-auto mb-3 max-w-[460px] text-lg font-medium leading-normal text-textBody">
            Scanner. Push to Talk. One app.
            <br />
            Clean. Ad-free. Built for first responders.
          </p>

          <p className="mx-auto mb-9 max-w-[400px] text-[13px] leading-relaxed text-textHint">
            Stream live police, fire &amp; EMS dispatch audio. Monitor two
            channels at once. Talk to your crew with built-in Push to Talk. Save
            your frequencies. No ads. No clutter.
          </p>

          <WaitlistForm />

          {/* Social proof */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex">
              {[
                { color: "#bf5a3a", bg: "bg-fire/20" },
                { color: "#4878a8", bg: "bg-law/20" },
                { color: "#4d8a5c", bg: "bg-ems/20" },
                { color: "#7a6b8a", bg: "bg-[#7a6b8a]/20" },
              ].map((a, i) => (
                <div
                  key={i}
                  className={`flex size-6 items-center justify-center rounded-full border-2 border-background ${a.bg} ${i > 0 ? "-ml-2" : ""}`}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill={a.color}
                    stroke="none"
                    aria-hidden={true}
                  >
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 00-16 0" />
                  </svg>
                </div>
              ))}
            </div>
            <span className="text-[11px] text-textHint">
              Join first responders &amp; scanner enthusiasts
            </span>
          </div>
        </section>

        {/* ── Features grid ── */}
        <section
          className="mx-auto mt-16 max-w-[700px] gap-3 px-6"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className={`rounded-xl border bg-surface px-[18px] py-5 text-left ${
                f.goldBorder ? "border-gold/10" : "border-border"
              }`}
            >
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-[7px] ${f.iconBg}`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden={true}
                  >
                    {f.paths}
                  </svg>
                </div>
                <span className="text-sm font-bold text-textSecondary">
                  {f.title}
                </span>
                {f.pro && (
                  <span className="rounded-[3px] bg-fire/[0.08] px-1.5 py-0.5 text-[8px] font-extrabold tracking-[0.1em] text-fire">
                    PRO
                  </span>
                )}
                {f.comingSoon && (
                  <span className="rounded-[3px] bg-gold/[0.08] px-[7px] py-0.5 text-[8px] font-extrabold tracking-[0.1em] text-gold">
                    COMING SOON
                  </span>
                )}
              </div>
              <p className="text-xs leading-normal text-textMuted">
                {f.desc}
                {f.link && (
                  <>
                    {" "}
                    <a
                      href={f.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent/80"
                    >
                      openmhz.com&nbsp;&rarr;
                    </a>
                  </>
                )}
              </p>
            </div>
          ))}
        </section>

        {/* ── Push to Talk roadmap ── */}
        <section className="mx-auto mt-14 max-w-[560px] px-6">
          <div className="rounded-[14px] border border-gold/10 bg-surface px-6 py-7 text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c89b3c"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden={true}
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="text-[10px] font-bold tracking-[0.1em] text-gold">
                COMING IN A FUTURE UPDATE
              </span>
            </div>

            <h2 className="mb-2 text-lg font-bold text-textPrimary">
              Push to Talk — Channels, Contacts &amp; Groups
            </h2>
            <p className="mx-auto mb-5 max-w-[460px] text-[13px] leading-[1.7] text-textBody">
              ToneOut is adding built-in walkie-talkie communication using
              Apple&apos;s PushToTalk framework. Map it to your iPhone&apos;s
              Action Button for instant, one-press transmission. Create channels,
              save contacts, organize your crew into groups — and talk from the
              Lock Screen, the Action Button, or anywhere in the system.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {roadmapItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-[10px] border border-borderLight bg-surfaceLight px-3 py-4 text-center"
                >
                  <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-lg bg-gold/10">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#c89b3c"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden={true}
                    >
                      {item.paths}
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-textSecondary">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-textMuted">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-textHint">
              Powered by Apple&apos;s native PushToTalk framework — works with
              the Action Button, Lock Screen, Bluetooth accessories, and in the
              background.
            </p>
          </div>
        </section>

        {/* ── Built for ── */}
        <section className="mx-auto mt-12 max-w-[500px] px-6 text-center">
          <p className="mb-4 text-[11px] font-bold tracking-[0.12em] text-textFaint">
            BUILT FOR
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Firefighters",
              "EMTs",
              "Dispatchers",
              "News Reporters",
              "Weather Spotters",
              "Scanner Enthusiasts",
              "Community Watch",
            ].map((role) => (
              <span
                key={role}
                className="rounded-full border border-border bg-surface px-3.5 py-[5px] text-[11px] font-medium text-textMuted"
              >
                {role}
              </span>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-16 border-t border-surfaceLight">
          <div className="flex flex-wrap justify-center gap-6 p-6">
            <Link
              href="/updates"
              className="text-xs font-medium text-textHint transition-colors hover:text-textMuted"
            >
              Updates
            </Link>
            <Link
              href="/privacy"
              className="text-xs font-medium text-textHint transition-colors hover:text-textMuted"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs font-medium text-textHint transition-colors hover:text-textMuted"
            >
              Terms of Use
            </Link>
            <Link
              href="/support"
              className="text-xs font-medium text-textHint transition-colors hover:text-textMuted"
            >
              Support
            </Link>
          </div>
          <p className="px-6 pb-10 text-center text-[11px] text-textFaint">
            © 2026 ToneOut. All rights reserved. Not affiliated with any
            government agency or emergency service.
          </p>
        </footer>
      </main>
  );
}
