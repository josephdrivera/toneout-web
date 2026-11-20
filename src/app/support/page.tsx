import type { Metadata } from "next";
import Link from "next/link";
import { ANDROID_LIVE, PLAY_STORE_URL } from "../../lib/links";
import FeedbackForm from "../../components/FeedbackForm";
import DemoRequestForm from "../../components/DemoRequestForm";

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
              feeds over the internet. Live streams come from{" "}
              <a
                href="https://www.broadcastify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80"
              >
                Broadcastify
              </a>
              {" "}and from our own ToneOut Network. Today that is one
              receiver node in Glastonbury, CT, and we are working to bring
              nodes to more towns and states (
              <a href="#firehouse" className="text-accent hover:text-accent/80">
                you can host one
              </a>
              ). On iPhone, ToneOut also plays recorded calls
              from{" "}
              <a
                href="https://openmhz.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80"
              >
                OpenMHz
              </a>
              , which archives trunked radio systems moments after each call
              happens. OpenMHz is coming to Android in a later update. ToneOut
              does not operate or control third party streams and is not
              responsible for their availability.
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
            {ANDROID_LIVE ? (
              <P>
                Yes. ToneOut for Android is a free download on{" "}
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  Google Play
                </a>
                , for Android 10 and later. It is a native Android app with
                the same scanner feeds, ToneOut Network channels, saved feeds,
                Tone Alerts, and Dual Listen as iPhone.
              </P>
            ) : (
              <P>
                Almost. ToneOut for Android is built and Google has approved
                it for the Play Store; the public release is being finalized
                now. Join the list on the{" "}
                <Link
                  href="/#android"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  homepage
                </Link>{" "}
                and we&apos;ll email you once, the day it goes live.
              </P>
            )}

            <Q>Why is a feed offline or unavailable?</Q>
            <P>
              Feeds come from Broadcastify, OpenMHz, and the ToneOut
              Network. Third party streams may go offline due to equipment issues,
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
              Use the{" "}
              <a href="#feedback" className="text-accent hover:text-accent/80">
                form below
              </a>
              . Tell us what happened and which phone you are on. We read
              every message.
            </P>

            <div id="feedback" className="scroll-mt-24">
              <H2>Requests and Feedback</H2>
            </div>

            <P>
              Send us your requests and the things you would like to see more
              of: a feed, a town, a feature. Feedback and bug reports go here
              too. It comes straight to us. Leave your email if you want a
              reply.
            </P>

            <div className="mb-4">
              <FeedbackForm />
            </div>

            <div id="firehouse" className="scroll-mt-24">
              <H2>Host a ToneOut Node: Firehouses and Homes</H2>
            </div>

            <P>
              Right now the ToneOut Network is one node, in Glastonbury, CT.
              We are working hard to push it across more towns and more
              states, and that takes people willing to host a node.
            </P>

            <P>
              <span className="font-semibold text-textSecondary">
                Fire departments:
              </span>{" "}
              want Tone Alerts for your firehouse? We are looking for
              departments to beta test a node at their station. For the first
              firehouses, ToneOut covers the cost of the node, the install,
              and managing it.
            </P>

            <P>
              <span className="font-semibold text-textSecondary">
                At your house:
              </span>{" "}
              you do not need to be a fire department. If you live close
              enough to a fire station, a police station, or a radio tower to
              pick up its signal, a node at your home can put your town on
              the network. Reach out and we will talk it through.
            </P>

            <P>
              A node is a small receive-only radio. It cannot transmit. This
              is a beta test and a supplement: ToneOut does not replace your
              pager, your dispatch, or response apps like IamResponding or
              First Due.{" "}
              <a
                href="/ToneOut-for-Your-Firehouse.pdf"
                target="_blank"
                rel="noopener"
                className="text-accent underline-offset-2 hover:underline"
              >
                Download the firehouse overview (PDF)
              </a>
              .
            </P>

            <div className="mb-4">
              <DemoRequestForm />
            </div>

            <H2>Refunds</H2>

            <P>
              <span className="font-semibold text-textSecondary">iPhone:</span>{" "}
              purchases are processed by Apple. Visit{" "}
              <a
                href="https://reportaproblem.apple.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80"
              >
                reportaproblem.apple.com
              </a>{" "}
              to request a refund.
            </P>

            <P>
              <span className="font-semibold text-textSecondary">Android:</span>{" "}
              purchases are processed by Google Play. Request a refund from
              your{" "}
              <a
                href="https://play.google.com/store/account/orderhistory"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80"
              >
                Google Play order history
              </a>
              . If Google Play will not refund it, send us a message through{" "}
              <a href="#feedback" className="text-accent hover:text-accent/80">
                Requests and Feedback
              </a>{" "}
              with the email on your Google account and we will sort it out.
            </P>
          </div>
        </div>
    </main>
  );
}
