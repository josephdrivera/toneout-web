// Sends the one-time "Android is live" email to the launch waitlist.
//
// 1. Export the waitlist from the production Convex deployment:
//      npx convex data waitlist --prod --limit 10000 --format jsonLines > waitlist.jsonl
// 2. Dry run (default): prints who would get it and writes a preview file.
//      node --env-file=.env.local scripts/send-android-launch.mjs waitlist.jsonl
// 3. Send to yourself first, then for real:
//      node --env-file=.env.local scripts/send-android-launch.mjs waitlist.jsonl --test you@example.com
//      node --env-file=.env.local scripts/send-android-launch.mjs waitlist.jsonl --send
//
// Recipients are waitlist rows with platform "android". Add --include-unknown
// to also send to rows that never picked a platform. Sent addresses are logged
// to android-launch-sent.log so a re-run never emails anyone twice.

import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { Resend } from "resend";
import { buildAndroidLaunchEmail } from "../src/lib/waitlist-email.ts";

const SUBJECT = "ToneOut for Android is live on Google Play";
const SENT_LOG = "android-launch-sent.log";
const PREVIEW = "android-launch-preview.html";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && a !== valueOf("--test"));
const send = args.includes("--send");
const includeUnknown = args.includes("--include-unknown");
const testTo = valueOf("--test");

function valueOf(flag) {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
}

if (!file) {
  console.error("Usage: send-android-launch.mjs <waitlist.jsonl> [--test addr | --send] [--include-unknown]");
  process.exit(1);
}

const rows = readFileSync(file, "utf8")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l));

const alreadySent = new Set(
  existsSync(SENT_LOG) ? readFileSync(SENT_LOG, "utf8").split("\n").filter(Boolean) : [],
);

const recipients = [
  ...new Set(
    rows
      .filter((r) => r.platform === "android" || (includeUnknown && !r.platform))
      .map((r) => String(r.email).trim().toLowerCase()),
  ),
].filter((e) => !alreadySent.has(e));

console.log(`${rows.length} waitlist rows; ${recipients.length} to email (${alreadySent.size} already sent).`);
writeFileSync(PREVIEW, buildAndroidLaunchEmail("you@example.com"));
console.log(`Preview written to ${PREVIEW}`);

if (!send && !testTo) {
  console.log("Dry run. Nothing sent. Use --test <address> or --send.");
  process.exit(0);
}

const key = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL;
if (!key || !from) {
  console.error("RESEND_API_KEY and RESEND_FROM_EMAIL must be set (use --env-file=.env.local).");
  process.exit(1);
}
const resend = new Resend(key);

const targets = testTo ? [testTo] : recipients;
let ok = 0;
for (const to of targets) {
  const { error } = await resend.emails.send({
    from,
    to,
    subject: SUBJECT,
    html: buildAndroidLaunchEmail(to),
  });
  if (error) {
    console.error(`FAILED ${to}: ${error.message}`);
  } else {
    ok += 1;
    if (!testTo) appendFileSync(SENT_LOG, `${to}\n`);
  }
  await new Promise((r) => setTimeout(r, 600)); // stay under Resend's rate limit
}
console.log(`Sent ${ok} of ${targets.length}.`);
