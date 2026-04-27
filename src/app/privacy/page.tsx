import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | ToneOut",
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

function B({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-textSecondary">{children}</strong>;
}

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="mb-8 text-xs text-textHint">
            Last updated: April 13, 2026
          </p>

          <div className="text-sm leading-relaxed text-textBody">
            <P>
              ToneOut (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the
              App&rdquo;) is committed to protecting your privacy. This Privacy
              Policy explains what information we collect, how we use it, and
              your rights.
            </P>

            <H2>Information We Collect</H2>

            <P>
              <B>Location Data:</B>{" "}If you grant permission, ToneOut accesses
              your approximate location solely to display nearby scanner feeds.
              Location data is processed on device and is not transmitted to our
              servers or any third party. You can revoke location access at any
              time in your device settings.
            </P>
            <P>
              <B>Waitlist Email:</B>{" "}If you join our waitlist, we collect your
              email address for the sole purpose of notifying you when ToneOut
              launches. Your email is stored securely and will not be shared with
              third parties.
            </P>
            <P>
              <B>Push to Talk Data:</B>{" "}When Push to Talk features become
              available, contact names and group names you create are stored
              locally on your device. Audio transmitted via Push to Talk is sent
              peer to peer through Apple&apos;s framework and is not recorded or
              stored by ToneOut.
            </P>
            <P>
              <B>Locally Stored Data:</B>{" "}Saved frequencies, bookmarks,
              contacts, groups, and preferences are stored locally on your
              device. This data never leaves your device.
            </P>
            <P>
              <B>Purchase Information:</B>{" "}If you purchase premium features, the
              transaction is handled entirely by Apple. We do not receive or
              store any payment information.
            </P>
            <P>
              <B>Analytics:</B>{" "}ToneOut does not use third party analytics,
              tracking SDKs, or advertising frameworks.
            </P>

            <H2>Information We Do Not Collect</H2>

            <P>
              We do not collect your name, phone number, or account credentials.
              No account creation is required. We do not use cookies or tracking
              pixels. We do not sell, share, or rent any data to third parties.
            </P>

            <H2>Third Party Services</H2>

            <P>
              ToneOut streams publicly available audio feeds from{" "}
              <a
                href="https://openmhz.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80"
              >
                OpenMHz
              </a>
              ,{" "}
              <a
                href="https://www.broadcastify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80"
              >
                Broadcastify
              </a>
              , and in the future our own ToneOut network. Third party streams
              are operated by their respective providers. ToneOut has no control
              over their availability, accuracy, or content; those providers
              have their own privacy policies. Push to Talk audio transmission
              uses Apple&apos;s native PushToTalk framework.
            </P>

            <H2>Children&apos;s Privacy</H2>

            <P>
              ToneOut is not directed at children under 13. We do not knowingly
              collect personal information from children.
            </P>

            <H2>Data Security</H2>

            <P>
              User data is stored locally on device and protected by your
              device&apos;s built in security measures including encryption and
              biometric locks.
            </P>

            <H2>Your Rights</H2>

            <P>
              You may request deletion of your waitlist email at any time by
              sending a note through Apple TestFlight&apos;s Send Beta Feedback
              for ToneOut and including the email address you want removed. On
              device data can be deleted by uninstalling the App.
            </P>

            <H2>Changes to This Policy</H2>

            <P>
              We may update this Privacy Policy periodically. Changes will be
              reflected by updating the &ldquo;Last updated&rdquo; date above.
            </P>

            <H2>Contact</H2>

            <P>
              Questions about this policy? During the beta, reach us through
              Send Beta Feedback in Apple TestFlight for ToneOut (see our{" "}
              <Link href="/support" className="text-accent hover:text-accent/80">
                Support
              </Link>{" "}
              page).
            </P>
          </div>
        </div>
    </main>
  );
}
