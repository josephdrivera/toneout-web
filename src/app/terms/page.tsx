import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — ToneOut",
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

export default function TermsOfUse() {
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
            Terms of Use
          </h1>
          <p className="mb-8 text-xs text-textHint">
            Last updated: April 13, 2026
          </p>

          <div className="text-sm leading-relaxed text-textBody">
            <P>
              By downloading, installing, or using ToneOut (&ldquo;the
              App&rdquo;), you agree to these Terms. If you do not agree, do not
              use the App.
            </P>

            <H2>Description of Service</H2>

            <P>
              ToneOut provides access to publicly available live audio streams
              from police, fire, EMS, and other public safety communications.
              Audio streams are sourced from{" "}
              <a
                href="https://openmhz.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80"
              >
                OpenMHz
              </a>
              , an open-source platform for public safety radio. ToneOut does
              not operate, control, or guarantee the availability of these
              streams. ToneOut also
              offers Push to Talk functionality using Apple&apos;s PushToTalk
              framework for walkie-talkie style communication between users.
              ToneOut does not directly intercept, decode, or receive radio
              frequencies. The App is currently available on iOS. An Android
              version is planned for a future release.
            </P>

            <H2>Acceptable Use</H2>

            <P>
              You agree to use ToneOut only for lawful purposes. You shall not
              use information obtained through the App to interfere with
              emergency services or law enforcement. You shall not use the Push
              to Talk feature to transmit illegal, threatening, or harassing
              content. You shall not rebroadcast or commercially exploit audio
              content without authorization.
            </P>

            <H2>Legal Compliance</H2>

            <P>
              Listening to publicly available scanner feeds is legal in most U.S.
              jurisdictions. Some states restrict scanner use while driving or
              during criminal activity. It is your sole responsibility to comply
              with all applicable laws.
            </P>

            <H2>No Emergency Service</H2>

            <P>
              <span className="font-bold text-fire">
                ToneOut is not an emergency service and should never be used as a
                substitute for calling 911.
              </span>{" "}
              Audio feeds may be delayed, interrupted, or unavailable. Push to
              Talk is not a replacement for emergency radio systems. Do not rely
              on ToneOut for emergency communications affecting personal safety.
            </P>

            <H2>Audio Content</H2>

            <P>
              Scanner audio may contain descriptions of violence, criminal
              activity, medical emergencies, and profanity. Push to Talk
              communications are between users and are not monitored or moderated
              by ToneOut. By using ToneOut, you acknowledge exposure to such
              content.
            </P>

            <H2>In-App Purchases</H2>

            <P>
              ToneOut offers optional premium features as one-time in-app
              purchases through Apple. All purchases are governed by
              Apple&apos;s terms and refund policies.
            </P>

            <H2>Intellectual Property</H2>

            <P>
              The ToneOut name, logo, and design are protected by applicable
              copyright and trademark laws.
            </P>

            <H2>Disclaimer of Warranties</H2>

            <P>
              ToneOut is provided &ldquo;as is&rdquo; without warranties of any
              kind. Audio streams are sourced from third-party providers
              including OpenMHz. We do not guarantee feed availability,
              accuracy, continuity, or Push to Talk connectivity. ToneOut is not
              responsible for streams going offline, being delayed, or becoming
              unavailable. Stream availability depends entirely on third-party
              infrastructure beyond our control.
            </P>

            <H2>Limitation of Liability</H2>

            <P>
              To the maximum extent permitted by law, ToneOut shall not be liable
              for any indirect, incidental, special, or consequential damages
              arising from use of the App.
            </P>

            <H2>Governing Law</H2>

            <P>
              These Terms are governed by the laws of the State of Connecticut.
            </P>

            <H2>Changes</H2>

            <P>
              We may modify these Terms at any time. Continued use constitutes
              acceptance.
            </P>

            <H2>Contact</H2>

            <P>
              Questions?{" "}
              <span className="text-accent">support@toneout.app</span>
            </P>
          </div>
        </div>
    </main>
  );
}
