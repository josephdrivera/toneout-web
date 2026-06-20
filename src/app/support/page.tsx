import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support | ToneOut",
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 text-[17px] font-bold text-textSecondary">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4">{children}</p>;
}

function Q({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 mt-5 font-semibold text-textSecondary">{children}</p>
  );
}

export default function Support() {
  return (
    <main className="bg-background pt-20">
        <div className="mx-auto max-w-2xl px-6 pb-16 pt-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-accent/80"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden={true}
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <h1 className="mb-2 text-[28px] font-extrabold tracking-tight text-textPrimary">
            Support
          </h1>
          <p className="mb-8 text-xs text-textHint">
            Last updated: April 13, 2026
          </p>

          <div className="text-sm leading-relaxed text-textBody">
            <P>
              Need help with ToneOut? We&apos;re here for you.
            </P>

            <H2>Frequently Asked Questions</H2>

            <Q>How does ToneOut work?</Q>
            <P>
              ToneOut streams publicly available police, fire, and EMS audio
              feeds over the internet. Today those streams come from{" "}
              <a
                href="https://www.broadcastify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80"
              >
                Broadcastify
              </a>
              . Coming soon: our own ToneOut network for listeners who want it
              straight from us. ToneOut does not operate or control third party
              streams and is not responsible for their availability. ToneOut does
              not directly receive radio frequencies.
            </P>

            <Q>What is Dual Listen?</Q>
            <P>
              A premium feature that lets you monitor two live feeds
              simultaneously with independent volume controls. One time
              purchase, no subscription.
            </P>

            <Q>What is Push to Talk?</Q>
            <P>
              A walkie talkie feature coming in a future update. Communicate
              with your crew using Apple&apos;s native PushToTalk framework. Map
              it to your iPhone&apos;s Action Button for instant one press
              transmission. Create channels, save contacts, organize groups,
              and work from the Lock Screen, the Action Button, or anywhere in
              the system.
            </P>

            <Q>Is ToneOut available on Android?</Q>
            <P>
              ToneOut is launching on iOS first. An Android version is planned
              for later in 2026. Join the waitlist to stay updated.
            </P>

            <Q>Why is a feed offline or unavailable?</Q>
            <P>
              Feeds come from Broadcastify and (eventually) ToneOut&apos;s
              network. Third party streams may go offline due to equipment issues,
              internet outages, or maintenance on their providers&apos; side.
              ToneOut has no control over individual stream availability. Try
              again later or search for an alternate feed in your area.
            </P>

            <Q>How do I restore my purchase on a new device?</Q>
            <P>
              Go to Settings in the app and tap &ldquo;Restore
              Purchases.&rdquo; Make sure you&apos;re signed in with the same
              Apple ID used for the original purchase.
            </P>

            <Q>Is it legal to listen to scanner feeds?</Q>
            <P>
              In most U.S. jurisdictions, yes. Some states restrict use while
              driving or during criminal activity. Please review your local
              laws.
            </P>

            <Q>Does ToneOut collect my data?</Q>
            <P>
              No. All preferences, saved frequencies, contacts, and groups are
              stored locally on your device. See our{" "}
              <Link href="/privacy" className="text-accent hover:text-accent/80">
                Privacy Policy
              </Link>{" "}
              for full details.
            </P>

            <Q>How do I report a bug or send feedback?</Q>
            <P>
              During the beta, use Apple&apos;s TestFlight: open the TestFlight
              app, select ToneOut, then tap{" "}
              <span className="font-semibold text-textSecondary">
                Send Beta Feedback
              </span>
              . You can attach a screenshot, describe what happened, and submit.
              That is the best way to reach us about crashes, audio issues, or
              anything that feels off.
            </P>

            <H2>Contact Us</H2>

            <P>
              While ToneOut is in beta, please use{" "}
              <span className="font-semibold text-textSecondary">
                Send Beta Feedback
              </span>{" "}
              in TestFlight (screenshots and notes welcome). We read every
              report.
            </P>

            <H2>Refunds</H2>

            <P>
              All purchases are processed by Apple. Visit{" "}
              <span className="text-accent">reportaproblem.apple.com</span> to
              request a refund.
            </P>
          </div>
        </div>
    </main>
  );
}
