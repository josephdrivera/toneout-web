export interface Update {
  id: string;
  date: string;
  title: string;
  body: string;
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
    body: "We pushed an update yesterday, and the timing felt right, so we're opening the beta up wider.\n\nThe first round of TestFlight invitations already went out to people who'd been on the waitlist longest. That group has been running the app, listening to real feeds, and sending feedback. It's been solid.\n\nToday we're opening it up wider. The first 100 people on iPhone can join the beta right now.\n\nWhat ToneOut is\n\nAn ad free scanner app for iPhone. No subscriptions, no banners, no upsells stacked on top of upsells. You open it, you pick a feed, you listen. Police, fire, EMS, wherever you are.\n\nIt was built out of frustration with every other scanner app on the market. Most of them are either riddled with ads, locked behind expensive monthly plans, or both. ToneOut is a one time thing: the app is free, and if you want Dual Listen (two feeds simultaneously, independent volume), that's a $4.99 one time purchase. That's it.\n\nAudio comes from OpenMHz and Broadcastify: nationwide coverage from both. Coming soon: our very own ToneOut network, built for ToneOut listeners.\n\nWhat's in the beta\n\n• Browse feeds by state or by your location\n• Sequential scanner style playback: calls play one after another the way a real scanner works\n• Dual Listen for two feeds at once (Pro, $4.99 one time)\n• Save systems you listen to regularly\n• Background audio with lock screen controls\n• Dark UI, no light mode, no clutter\n\nHow to join\n\niPhone only. You'll need Apple's TestFlight app installed. It's free from the App Store if you don't have it already.\n\nOnce you have TestFlight, tap the link below and ToneOut installs like any other app:\n\nJoin the ToneOut Beta on TestFlight\nhttps://testflight.apple.com/join/KMJQ1YVE\n\nSpots are capped at 100 for this round. When that fills up, the link will stop accepting new testers.\n\nA couple of notes\n\nThis is beta software. It's stable. We've been running it daily, but beta means bugs happen. If something sounds wrong, crashes, or doesn't behave the way you'd expect, use TestFlight's Send Beta Feedback: you can attach a screenshot and a note, and it goes straight to us. That feedback directly shapes what gets fixed before the full App Store release.\n\nAlso: ToneOut is not an emergency service. Scanner audio is delayed. Always call 911.\n\nFull App Store release is coming. This is the step before that.\n\nDon't forget to sign up for the waitlist for when it comes out: https://toneout.app/",
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
    title: "New Audio Infrastructure: OpenMHz & Future Plans",
    body: "After extensive research into audio sourcing options, we've made a deliberate decision to partner with OpenMHz, an open source platform built specifically for streaming and archiving public safety radio communications. OpenMHz gives us full transparency into how audio is captured and delivered, the flexibility to build on top of an open ecosystem, and a community driven foundation that aligns with what ToneOut is all about. We believe open source infrastructure is the right way to build tools for first responders and the communities they serve.\n\nRadioReference has paused new commercial API licenses due to an unprecedented surge in demand driven by AI products. We respect their decision and wish them well, but honestly, this pushed us toward something even better.\n\nLooking ahead, we're also researching what it would take to run our own dedicated feed infrastructure. The early plan is to start small, testing in our own town first, and learn from there. Down the road, we'd love to make it possible for others to set up their own nodes, whether through a kit list or a simple guide. Nothing is set in stone yet, but the long term vision is to give ToneOut its own independent coverage that doesn't rely entirely on third party providers.\n\nThat kind of independence is what will set ToneOut apart from every other scanner app out there. We're taking it one step at a time, but we're building toward something bigger. Stay tuned.",
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
