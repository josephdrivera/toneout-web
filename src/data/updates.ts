import { APP_STORE_URL } from "../lib/links";

export type UpdateBlock =
  | { type: "text"; text: string }
  | { type: "taggedLine"; text: string; tag: string }
  | { type: "disclaimer"; text: string };

export interface Update {
  id: string;
  date: string;
  title: string;
  /** Plain-text body. Ignored when `blocks` is set. */
  body?: string;
  /** Rich body: ordered blocks with tagged lines and disclaimer callouts. */
  blocks?: UpdateBlock[];
  tag?: "new" | "improvement" | "fix" | "announcement";
  cta?: {
    label: string;
    href: string;
    tone?: "fire" | "accent";
    note?: {
      prefix: string;
      linkLabel: string;
      href: string;
    };
  };
}

export const updates: Update[] = [
  {
    id: "android-in-review",
    date: "August 19, 2026",
    title: "ToneOut for Android — In Review Right Now, Public Launch Next",
    blocks: [
      {
        type: "text",
        text: "Android is the question we get more than any other, so here's the full, honest picture — including the update sitting in Google's review queue as you read this.\n\nWhere Android actually stands\n\nToneOut for Android is built. It's a real native Android app — written in Kotlin, not a port or a web wrapper — and it's been in closed beta testing on Google Play since early July.\n\nHere's the part most people don't see: Google requires new developer accounts to run a closed test and prove the app holds up before it's allowed into the public Play Store. To get through that requirement properly, we ran the beta through a professional QA lab — 25 Android testers working a structured 22-point pass over two weeks: onboarding, live playback, saved and custom feeds, location permissions, billing. Every core flow passed, with zero crashes.\n\nThat testing wrapped, and last night the production application went in — the formal request to take ToneOut public on Google Play. Google reviews those by hand. It can take a few days; it can be faster. The moment it's approved, Android goes live for everyone at once.\n\nThe update in review right now\n\nWhile that application is with Google, a new build — Android v1.1 — is in the review queue and should start reaching beta testers as soon as today. What's in it:\n\n• Broadcastify feeds now open Broadcastify's official player — the same change we shipped on iPhone in v1.3, after Broadcastify retired the direct streams apps used to play.\n\n• Google Play billing rebuilt for the Dual Listen unlock — this one came straight out of the QA findings.\n\n• The new ToneOut app icon.\n\n• Playback and stability fixes, now targeting Android 16.\n\nThis is the exact build that goes public when Google approves the application — it's not a preview, it's the release.\n\nWhat Android gets on day one\n\nThe full ToneOut experience, same as iPhone: browse scanner feeds by state, every ToneOut Network channel — all 14 live streams from the Glastonbury node — Nearby feeds by GPS (location never leaves your phone), saved feeds, custom stream URLs, background playback with lock-screen controls, and Dual Listen as a one-time unlock. Dark, ad-free, no account, no tracking.\n\nAnd Tone Alerts? The groundwork shipped this morning: the Glastonbury node's tone detector — the same one that pages iPhones today — learned to speak Google's push system, and that update is running on the node right now. The Android app already carries the Tone Alerts screen; the next Android build turns it on.\n\nIf you're waiting on Android, do one thing: drop your email in the waitlist below. That list gets exactly one email — the one that says ToneOut is live on Google Play. And when Google gives the word, this page and our Facebook page are where you'll hear it first.",
      },
      {
        type: "taggedLine",
        text: "Tone Alerts on Android: the server side went live on the node this morning — alerts switch on in the next Android build after launch.",
        tag: "COMING SOON",
      },
      {
        type: "disclaimer",
        text: "ToneOut is not an emergency service and does not replace your pager or official dispatch. Scanner audio can be delayed. Always call 911 in an emergency.",
      },
    ],
    tag: "announcement",
    cta: {
      label: "Join the Android launch list",
      href: "https://toneout.app/#android",
      tone: "fire",
    },
  },
  {
    id: "broadcastify-changes-and-v1-3",
    date: "August 1, 2026",
    title: "What Happened to Broadcastify Feeds — and ToneOut v1.3",
    blocks: [
      {
        type: "text",
        text: "If ToneOut has felt broken this week, you're not imagining it — and it wasn't your phone. Here's the honest rundown of what happened and what we did about it.\n\nTwo separate things went wrong at once.\n\n1. Broadcastify changed how apps can access their audio.\n\nBroadcastify recently retired the free direct-stream links that ToneOut (and other scanner apps) used to play their feeds, and made static stream links a Broadcastify Premium feature. The result: every Broadcastify feed in the app stopped connecting, on every network, while their website kept working. That change happened on their side — but explaining it is on us, and here it is.\n\n2. Our v1.2 update shipped with a real bug.\n\nToneOut Network streams in v1.2 could connect, show LIVE, and then play silence. That one was ours. We found it, fixed it, and rebuilt the streaming engine on the exact playback code that ran reliably for months in v1.1.\n\nWhat v1.3 does\n\n• Broadcastify feeds now open Broadcastify's official player right inside the app — the same free, ad-supported player as their website, so it works the same way the website does and keeps working if they change things again.\n\n• ToneOut Network streams play natively again, on the proven v1.1 audio engine. This also fixes the overheating some of you noticed during long listening sessions.\n\n• Feeds renamed for clarity — \"Glastonbury Dispatch\" is now \"Glastonbury Dispatch Fire.\"\n\nv1.3 is on its way to the App Store now and should be available within a few days, pending Apple review. Update as soon as you see it.\n\nThe bigger lesson\n\nThis week is exactly why the ToneOut Network exists. Feeds that live on someone else's servers can change or disappear overnight — we just lived it. Our own receiver nodes are different: 13 channels are streaming from the Glastonbury node right now, they're ours, and nobody can paywall them or shut them off. More receivers and more towns are already in motion.\n\nQuestions, or a feed acting up? Reach out on our Facebook page — those reports are exactly how this got tracked down.",
      },
      {
        type: "disclaimer",
        text: "ToneOut is not an emergency service and does not replace your pager or official dispatch. Scanner audio can be delayed. Always call 911 in an emergency.",
      },
    ],
    tag: "announcement",
    cta: {
      label: "Download on the App Store",
      href: APP_STORE_URL,
      tone: "fire",
    },
  },
  {
    id: "node-01-thirteen-channels",
    date: "July 27, 2026",
    title: "One Antenna, 13 Channels — the Glastonbury Node Just Got a Lot Bigger",
    blocks: [
      {
        type: "text",
        text: "ToneOut Node 01 in Glastonbury just went from 3 streams to 13 — same Raspberry Pi, same single antenna.\n\nHere's the trick: the software-defined radio in the node doesn't tune one frequency like a scanner does. It captures a whole 2.4 MHz slice of spectrum at once, and software pulls individual channels out of that slice. Until now we were only decoding two of them. We re-centered the receiver, and now every public safety channel in that slice streams simultaneously — nothing takes turns, nothing gets missed.\n\nNew channels live right now:\n\n• Glastonbury Fire Police (452.1875 MHz)\n• Manchester Fire 1 (452.775 MHz)\n• Manchester Fire 2 / 8th District (453.4625 MHz)\n• South Windsor Fire (453.2375 MHz)\n• Rocky Hill Fire (453.575 MHz)\n• Rocky Hill EMS (453.275 MHz)\n• Wethersfield EMS (453.025 MHz)\n• Marlborough Fire Ops (453.3125 MHz)\n• East Hartford Fire Admin (453.85 MHz)\n• CRCOG Intercity Fire (452.1375 MHz)\n• UCALL40 Mutual Aid (453.2125 MHz)\n\nGlastonbury Dispatch (452.445 MHz) and Glastonbury EMS (453.075 MHz) are unchanged — same streams, same recordings, and Tone Alerts keep watching dispatch 24/7 exactly as before.\n\nIf you already have the app, there's nothing to update. The new feeds show up on their own — just open ToneOut and they're in the list.\n\nOne honest note: the new frequencies come from public scanner databases, and some of that data is old. A few of these channels may turn out to be quiet or moved. If a feed seems dead — or you know the local radio scene and spot something we got wrong — reach out on our Facebook page. That feedback directly shapes what stays, what goes, and what gets added.",
      },
      {
        type: "taggedLine",
        text: "Two more receivers are already ordered for this node — next up: East Hartford Fire Dispatch (460.600 MHz) and more surrounding towns.",
        tag: "COMING SOON",
      },
      {
        type: "disclaimer",
        text: "ToneOut is not an emergency service and does not replace your pager or official dispatch. Scanner audio can be delayed. Always call 911 in an emergency.",
      },
    ],
    tag: "new",
    cta: {
      label: "Listen now",
      href: "https://feeds.toneout.app",
      tone: "fire",
    },
  },
  {
    id: "v1-1-tone-alerts",
    date: "July 21, 2026",
    title: "ToneOut v1.1 — Tone Alerts",
    blocks: [
      {
        type: "text",
        text: "ToneOut v1.1 is live on the App Store.\n\nNew: Tone Alerts\n\nGet a push notification the moment your department is toned out. ToneOut listens to Glastonbury dispatch 24/7 and detects real Quick Call II two-tone pages — the same tones your pager hears. When your tones drop, your phone goes off.\n\nAll-Call alerts are free.",
      },
      {
        type: "taggedLine",
        text: "Individual company alerts: coming soon as a subscription.",
        tag: "COMING SOON",
      },
      {
        type: "disclaimer",
        text: "ToneOut does not replace your pager. Tone Alerts are a convenience feature and depend on internet connectivity, push notification delivery, and receiver uptime. Your department-issued pager and official dispatch remain your primary alerting. ToneOut is not an emergency service. Always call 911 in an emergency.",
      },
      {
        type: "text",
        // TODO: link "Facebook page" to the ToneOut Facebook page URL once it's in the codebase.
        text: "Also in this release\n\nImproved live stream reliability on ToneOut Network feeds.\n\nFixed an issue where some feeds would load but never play.\n\nMore ToneOut nodes are coming — we're working with fire departments to install receiver nodes in new coverage areas. Want your town covered? Reach out on our Facebook page.\n\nWhy ToneOut\n\nToneOut came out of conversations around the firehouse about gaps in how members get alerted and hear what's going on. It doesn't replace IamResponding or the response apps your department already runs — it's a supplement: live dispatch audio and tone alerts alongside the tools you already have.\n\nToneOut is not an emergency service and is not a substitute for official dispatch paging. Always call 911 in an emergency.",
      },
    ],
    tag: "new",
    cta: {
      label: "Download on the App Store",
      href: APP_STORE_URL,
      tone: "fire",
    },
  },
  {
    id: "now-on-the-app-store",
    date: "July 1, 2026",
    title: "ToneOut Is Live on the App Store",
    body: "It's official — ToneOut is approved and live on the App Store. After months of building, testing, and a stint in Apple's review queue, you can download it right now, for free.\n\nWhat you get today\n\nA free, ad-free scanner for iPhone. Stream live police, fire, and EMS dispatch audio from a curated library of Broadcastify feeds across nine states — Connecticut, New York, New Jersey, Pennsylvania, Massachusetts, Florida, Illinois, Texas, and California. Save your favorites for one-tap access, and keep your stream controls handy with the persistent Now Playing bar. No account, no subscription.\n\nGo further with Pro (one-time purchase, no subscriptions): Dual Listen monitors two feeds at once with independent volume, and Background Audio keeps you listening from the Lock Screen and Control Center while you use other apps.\n\nWhat's next\n\nWe're just getting started. Android beta opens by the end of this week, we're adding more states to our Broadcastify coverage, and we're bringing more ToneOut Network nodes online. Push to Talk is what we're building next — it lands on iOS first, then Android after testing. See the full plan on our new roadmap, and tell us what you want built.\n\nDownload ToneOut free on the App Store and see the roadmap at https://toneout.app/roadmap.",
    tag: "announcement",
    cta: {
      label: "Download on the App Store",
      href: APP_STORE_URL,
      tone: "fire",
    },
  },
  {
    id: "toneout-is-here",
    date: "June 19, 2026",
    title: "ToneOut Is Here \u2014 Here's Everything You Need to Know",
    body: "ToneOut has been submitted to the App Store. After months of development, the iOS app is now in Apple's review queue. Here's what's launching and what's on the way.\n\nWhat ToneOut is\n\nA free, ad-free scanner app for iPhone. It streams live dispatch audio from police, fire, and EMS feeds. No account, no subscription \u2014 you tap a feed and listen.\n\nCore features\n\nBrowse and listen \u2014 A curated library of Broadcastify scanner feeds organized by state. We're launching with coverage across nine states \u2014 Connecticut, New York, New Jersey, Pennsylvania, Massachusetts, Florida, Illinois, Texas, and California \u2014 and adding more regularly.\n\nSave your favorites \u2014 Save any feed for one-tap access. No account needed; everything is stored locally on your device.\n\nNow Playing bar \u2014 A persistent Now Playing bar keeps your stream controls handy no matter where you are in the app.\n\nPro features (one-time purchase)\n\nDual Listen \u2014 Monitor two feeds at once, each with its own independent volume. Follow an incident across multiple agencies without losing either channel.\n\nBackground Audio \u2014 Keep listening while you're in other apps. ToneOut keeps playing from the Lock Screen and Control Center with the screen off.\n\nBoth are available individually or as a bundle. One-time purchase \u2014 you own them for good, no recurring charges.\n\nToneOut Network (beta)\n\nToneOut Network is our own live audio infrastructure. We've got our first Raspberry Pi node deployed in the field, capturing and streaming real radio traffic straight through the app. This is early \u2014 coverage is limited to wherever active nodes are running, and more are coming soon. If you'd want to host one in your area, reach out.\n\nWhat's coming next\n\nAndroid \u2014 beta testing starts by the end of next week. Sign up at toneout.app if you want early access.\n\nMore states, more coverage \u2014 we're adding new Broadcastify feeds and expanding ToneOut Network coverage as we go.\n\nGet ToneOut\n\nToneOut for iOS is in App Store review right now. Once it's approved it'll be a free download at https://toneout.app/.",
    tag: "announcement",
  },
  {
    id: "first-toneout-node-live",
    date: "May 25, 2026",
    title: "First ToneOut Node is live for testing",
    body: "The first ToneOut Node went live today. ToneOut Nodes are our own self-hosted radio feeds \u2014 a Raspberry Pi with an SDR antenna running out of Glastonbury, CT, streaming local fire and EMS dispatch over HTTPS to anyone who wants to listen.\n\nThree streams are public right now from the Glastonbury node:\n\n\u2022 Dispatch (452.445 MHz)\n\u2022 EMS (453.075 MHz)\n\u2022 Combined Fire/EMS\n\nListen at feeds.toneout.app \u2014 the dashboard lists each one. Most useful when there's actually a run going.\n\nThis is beta \u2014 one node, one town, one antenna. The bigger plan is a distributed network of these nodes hosted by first responders, radio enthusiasts, and anyone else who wants to put one up for their own town. I'll be putting together pre-configured kits for anyone who wants one \u2014 power them on, plug into internet, and the node automatically joins the ToneOut network and starts feeding. If you'd rather configure your own, I'll provide the full instructions for that path too. Either way, all you need on your end is power and internet.\n\nThe iOS app is in TestFlight and is being wired up to consume these streams next.\n\nIf you hear something cut out, sound rough, or fail to load \u2014 let me know. Beta means feedback matters.\n\nIf you're interested in hosting a node for your town, get in touch.",
    tag: "new",
    cta: {
      label: "Listen now",
      href: "https://feeds.toneout.app",
      tone: "fire",
      note: {
        prefix: "Best on iPhone \u2014 ",
        linkLabel: "open in the ToneOut TestFlight beta",
        href: "https://testflight.apple.com/join/KMJQ1YVE",
      },
    },
  },
  {
    id: "toneout-beta-is-open",
    date: "April 28, 2026",
    title: "ToneOut Beta Is Open",
    body: "We pushed an update yesterday, and the timing felt right, so we're opening the beta up wider.\n\nThe first round of TestFlight invitations already went out to people who'd been on the waitlist longest. That group has been running the app, listening to real feeds, and sending feedback. It's been solid.\n\nToday we're opening it up wider. The first 100 people on iPhone can join the beta right now.\n\nWhat ToneOut is\n\nAn ad free scanner app for iPhone. No subscriptions, no banners, no upsells stacked on top of upsells. You open it, you pick a feed, you listen. Police, fire, EMS, wherever you are.\n\nIt was built out of frustration with every other scanner app on the market. Most of them are either riddled with ads, locked behind expensive monthly plans, or both. ToneOut is a one time thing: the app is free, and if you want Dual Listen (two feeds simultaneously, independent volume), that's a $4.99 one time purchase. That's it.\n\nAudio comes from Broadcastify: nationwide coverage. Coming soon: our very own ToneOut network, built for ToneOut listeners.\n\nWhat's in the beta\n\n• Browse feeds by state or by your location\n• Sequential scanner style playback: calls play one after another the way a real scanner works\n• Dual Listen for two feeds at once (Pro, $4.99 one time)\n• Save systems you listen to regularly\n• Background audio with lock screen controls\n• Dark UI, no light mode, no clutter\n\nHow to join\n\niPhone only. You'll need Apple's TestFlight app installed. It's free from the App Store if you don't have it already.\n\nOnce you have TestFlight, tap the link below and ToneOut installs like any other app:\n\nJoin the ToneOut Beta on TestFlight\nhttps://testflight.apple.com/join/KMJQ1YVE\n\nSpots are capped at 100 for this round. When that fills up, the link will stop accepting new testers.\n\nA couple of notes\n\nThis is beta software. It's stable. We've been running it daily, but beta means bugs happen. If something sounds wrong, crashes, or doesn't behave the way you'd expect, use TestFlight's Send Beta Feedback: you can attach a screenshot and a note, and it goes straight to us. That feedback directly shapes what gets fixed before the full App Store release.\n\nAlso: ToneOut is not an emergency service. Scanner audio is delayed. Always call 911.\n\nFull App Store release is coming. This is the step before that.\n\nDon't forget to sign up for the waitlist for when it comes out: https://toneout.app/",
    tag: "announcement",
  },
  {
    id: "android-after-ios",
    date: "April 17, 2026",
    title: "Android is coming, after iOS",
    body: "Since opening the waitlist, a ton of you have asked about Android in texts, emails, and DMs. Thank you for the feedback, and for signing up. It's what keeps this moving.\n\nHere's the plan: iOS ships first. After that, work starts on a native Android version of ToneOut, built in Kotlin. Not a port, not a wrapper. A real Android app.\n\nReal talk: I'm a Swift and web developer, not a Kotlin developer. That's where Claude Code comes in. I'll be leaning on it heavily to bridge the gap and help me build a proper Kotlin app from the ground up. It means Android takes longer than iOS did, but it'll be done right.\n\nThe bigger goal is a shared ToneOut network across both platforms. When push to talk arrives, iPhone and Android users will be on the same channels and will be able to talk to each other. A few features will stay platform specific based on what each phone supports, but the core scanner and PTT experience works on both.\n\nOne of the biggest things I've been focused on is latency. It's come up in almost every conversation with people who know radio systems well, and it's something I've been researching hard. A scanner is only as good as how fast audio reaches you. The goal is to push latency as low as physically possible, on both iOS and Android, for both live dispatch audio and push to talk between users.\n\niOS first. Android follows.",
    tag: "announcement",
  },
  {
    id: "openmhz-and-dedicated-network",
    date: "April 16, 2025",
    title: "New Audio Infrastructure: Broadcastify & Future Plans",
    body: "After a lot of research into audio sourcing, we've gone with Broadcastify to power ToneOut's feeds. Broadcastify gives us reliable, nationwide coverage of public safety radio, which means ToneOut can launch with feeds just about anywhere you are. It's a solid foundation to build on while we work toward audio infrastructure of our own.\n\nRadioReference has paused new commercial API licenses due to an unprecedented surge in demand driven by AI products. We respect their decision and wish them well, but honestly, this pushed us toward something even better.\n\nLooking ahead, we're also researching what it would take to run our own dedicated feed infrastructure. The early plan is to start small, testing in our own town first, and learn from there. Down the road, we'd love to make it possible for others to set up their own nodes, whether through a kit list or a simple guide. Nothing is set in stone yet, but the long term vision is to give ToneOut its own independent coverage that doesn't rely entirely on third party providers.\n\nThat kind of independence is what will set ToneOut apart from every other scanner app out there. We're taking it one step at a time, but we're building toward something bigger. Stay tuned.",
    tag: "announcement",
  },
  {
    id: "welcome",
    date: "April 15, 2026",
    title: "Welcome to ToneOut Updates",
    body: "This is where we'll post development progress, new features, and announcements. Stay tuned as we build ToneOut, the scanner and push to talk app designed for first responders.",
    tag: "announcement",
  },
];
