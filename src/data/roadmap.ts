import { ANDROID_LIVE } from "../lib/links";

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

const ANDROID_ITEM: RoadmapItem = ANDROID_LIVE
  ? {
      id: "android-beta",
      title: "Android on Google Play",
      description:
        "ToneOut for Android is live on Google Play — a native Kotlin app with the same scanner feeds, ToneOut Network channels, saved feeds, Tone Alerts, and Dual Listen as iPhone. Free, ad-free, no account.",
      status: "shipped",
    }
  : {
      id: "android-beta",
      title: "Android on Google Play",
      description:
        "A native Android version of ToneOut, built in Kotlin. The closed beta ran through a professional QA pass and Google has approved ToneOut for the Play Store. The public release is being finalized — join the list on the homepage to get the launch email.",
      status: "in-progress",
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
    id: "openmhz-ios",
    title: "OpenMHz feeds on iPhone",
    description:
      "A second feed source in the iPhone app. OpenMHz plays recorded calls from trunked radio systems moments after they happen, alongside Broadcastify's live streams and the ToneOut Network.",
    status: "shipped",
  },
  {
    id: "first-node",
    title: "First ToneOut Node",
    description:
      "Our own live audio infrastructure went live with the first Raspberry Pi node in Glastonbury, CT — now streaming 15 live channels of fire, EMS, and police dispatch from towns across the Capitol Region, straight through the app.",
    status: "shipped",
  },
  {
    id: "pro-features",
    title: "Dual Listen & Background Audio (Pro)",
    description:
      "Monitor two feeds at once with independent volume, and keep listening from the Lock Screen and Control Center. One-time purchase, no subscriptions.",
    status: "shipped",
  },
  {
    id: "tone-alerts",
    title: "Tone Alerts",
    description:
      `A push notification the moment your department is toned out — ToneOut Network nodes listen to dispatch 24/7 and detect real Quick Call II two-tone pages, so alerts work in towns the network covers. All-Call alerts are free; individual company alerts are ${ANDROID_LIVE ? "a one-time purchase per town, not a subscription" : "coming as a one-time purchase per town, not a subscription"}. ${ANDROID_LIVE ? "Live on iOS and Android." : "Live on iOS since v1.1, and on Android from launch day."} Does not replace your pager.`,
    status: "shipped",
  },

  {
    id: "standby",
    title: "Standby",
    description:
      "Listen to your music and still catch the call. With Standby on, when one of your departments is toned out your music lowers and the live dispatch channel plays, then your music comes back. Live on iOS since v1.4 and on Android. Does not replace your pager.",
    status: "shipped",
  },

  ...(ANDROID_LIVE ? [ANDROID_ITEM] : []),

  // ── In Progress ──
  ...(ANDROID_LIVE ? [] : [ANDROID_ITEM]),
  {
    id: "more-states",
    title: "More states & feeds",
    description:
      "We're expanding Broadcastify coverage beyond the launch nine — adding new states and feeds on a rolling basis.",
    status: "in-progress",
  },
  {
    id: "openmhz-android",
    title: "OpenMHz feeds on Android",
    description:
      "OpenMHz is in the iPhone app today. We're adding it to ToneOut for Android in a later update.",
    status: "next",
  },
  {
    id: "more-nodes",
    title: "More ToneOut Network nodes",
    description:
      "The ToneOut Network is just getting started, and we're working hard to push it across more towns and states. If you'd host a node at your firehouse, or at your house near a fire station, police station, or radio tower, reach out through the form on our Support page.",
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
