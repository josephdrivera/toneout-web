export interface Update {
  id: string;
  date: string;
  title: string;
  body: string;
  tag?: "new" | "improvement" | "fix" | "announcement";
}

export const updates: Update[] = [
  {
    id: "android-after-ios",
    date: "April 17, 2026",
    title: "Android is coming, after iOS",
    body: "Since opening the waitlist, a ton of you have asked about Android in texts, emails, and DMs. Thank you for the feedback, and for signing up. It's what keeps this moving.\n\nHere's the plan: iOS ships first. After that, work starts on a native Android version of ToneOut, built in Kotlin. Not a port, not a wrapper. A real Android app.\n\nReal talk: I'm a Swift and web developer, not a Kotlin developer. That's where Claude Code comes in. I'll be leaning on it heavily to bridge the gap and help me build a proper Kotlin app from the ground up. It means Android takes longer than iOS did, but it'll be done right.\n\nThe bigger goal is a shared ToneOut network across both platforms. When push-to-talk arrives, iPhone and Android users will be on the same channels and will be able to talk to each other. A few features will stay platform-specific based on what each phone supports, but the core scanner and PTT experience works on both.\n\nOne of the biggest things I've been focused on is latency. It's come up in almost every conversation with people who know radio systems well, and it's something I've been researching hard. A scanner is only as good as how fast audio reaches you. The goal is to push latency as low as physically possible, on both iOS and Android, for both live dispatch audio and push-to-talk between users.\n\niOS first. Android follows.",
    tag: "announcement",
  },
  {
    id: "openmhz-and-dedicated-network",
    date: "April 16, 2025",
    title: "New Audio Infrastructure: OpenMHz & Future Plans",
    body: "After extensive research into audio sourcing options, we've made a deliberate decision to partner with OpenMHz, an open-source platform built specifically for streaming and archiving public safety radio communications. OpenMHz gives us full transparency into how audio is captured and delivered, the flexibility to build on top of an open ecosystem, and a community-driven foundation that aligns with what ToneOut is all about. We believe open-source infrastructure is the right way to build tools for first responders and the communities they serve.\n\nRadioReference has paused new commercial API licenses due to an unprecedented surge in demand driven by AI products. We respect their decision and wish them well, but honestly, this pushed us toward something even better.\n\nLooking ahead, we're also researching what it would take to run our own dedicated feed infrastructure. The early plan is to start small, testing in our own town first, and learn from there. Down the road, we'd love to make it possible for others to set up their own nodes, whether through a kit list or a simple guide. Nothing is set in stone yet, but the long-term vision is to give ToneOut its own independent coverage that doesn't rely entirely on third-party providers.\n\nThat kind of independence is what will set ToneOut apart from every other scanner app out there. We're taking it one step at a time, but we're building toward something bigger. Stay tuned.",
    tag: "announcement",
  },
  {
    id: "welcome",
    date: "April 15, 2026",
    title: "Welcome to ToneOut Updates",
    body: "This is where we'll post development progress, new features, and announcements. Stay tuned as we build ToneOut, the scanner and push-to-talk app designed for first responders.",
    tag: "announcement",
  },
];
