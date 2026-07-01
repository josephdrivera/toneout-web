export type RoadmapStatus = "shipped" | "in-progress" | "next" | "exploring";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
}

export const STATUS_ORDER: RoadmapStatus[] = [
  "shipped",
  "in-progress",
  "next",
  "exploring",
];

export const STATUS_META: Record<
  RoadmapStatus,
  { label: string; blurb: string }
> = {
  shipped: {
    label: "Shipped",
    blurb: "Live now and in your hands.",
  },
  "in-progress": {
    label: "In Progress",
    blurb: "Actively being built — landing soon.",
  },
  next: {
    label: "Up Next",
    blurb: "What we're building right after.",
  },
  exploring: {
    label: "Exploring",
    blurb: "Ideas we're researching. Not committed yet.",
  },
};

export const roadmap: RoadmapItem[] = [
  // ── Shipped ──
  {
    id: "ios-app-store",
    title: "iOS on the App Store",
    description:
      "ToneOut for iPhone is approved and available as a free download. Browse feeds, save favorites, and listen with the persistent Now Playing bar.",
    status: "shipped",
  },
  {
    id: "broadcastify-nine-states",
    title: "Broadcastify feeds across 9 states",
    description:
      "A curated library of scanner feeds organized by state — Connecticut, New York, New Jersey, Pennsylvania, Massachusetts, Florida, Illinois, Texas, and California.",
    status: "shipped",
  },
  {
    id: "first-node",
    title: "First ToneOut Node",
    description:
      "Our own live audio infrastructure went live with the first Raspberry Pi node in Glastonbury, CT — real fire and EMS dispatch streamed straight through the app.",
    status: "shipped",
  },
  {
    id: "pro-features",
    title: "Dual Listen & Background Audio (Pro)",
    description:
      "Monitor two feeds at once with independent volume, and keep listening from the Lock Screen and Control Center. One-time purchase, no subscriptions.",
    status: "shipped",
  },

  // ── In Progress ──
  {
    id: "android-beta",
    title: "Android beta",
    description:
      "A native Android version of ToneOut. Beta testing opens by the end of this week — join the list on the homepage to get notified the moment it's live.",
    status: "in-progress",
  },
  {
    id: "more-states",
    title: "More states & feeds",
    description:
      "We're expanding Broadcastify coverage beyond the launch nine — adding new states and feeds on a rolling basis.",
    status: "in-progress",
  },
  {
    id: "more-nodes",
    title: "More ToneOut Network nodes",
    description:
      "Bringing additional nodes online to grow our own independent coverage beyond the first Glastonbury node.",
    status: "in-progress",
  },

  // ── Up Next ──
  {
    id: "push-to-talk",
    title: "Push to Talk",
    description:
      "Built-in walkie-talkie communication using Apple's PushToTalk framework — mapped to the Action Button, the Lock Screen, or anywhere in the system. Launching on iOS first, then coming to Android after sufficient testing.",
    status: "next",
  },
  {
    id: "channels-contacts-groups",
    title: "Channels, Contacts & Groups",
    description:
      "Create channels, save contacts, and organize your crew into groups so you can talk to the right people instantly.",
    status: "next",
  },

  // ── Exploring ──
  {
    id: "distributed-network",
    title: "Community-hosted node network",
    description:
      "A distributed network of ToneOut Nodes hosted by first responders and radio enthusiasts. Pre-configured kits you power on and plug into the internet — the node joins the network automatically. Reach out if you'd like to host one for your town.",
    status: "exploring",
  },
];
