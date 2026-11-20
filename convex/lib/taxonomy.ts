import { v } from "convex/values";

export const SOURCE_TYPES = ["rss", "atom"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const sourceTypeValidator = v.union(
  v.literal("rss"),
  v.literal("atom"),
);

export const CATEGORIES = [
  "structure-fire",
  "brush-fire",
  "mva-rescue",
  "ems",
  "hazmat",
  "water-rescue",
  "training",
  "personnel",
  "apparatus",
  "station",
  "grants-legislation",
  "memorial",
  "community",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const categoryValidator = v.union(
  v.literal("structure-fire"),
  v.literal("brush-fire"),
  v.literal("mva-rescue"),
  v.literal("ems"),
  v.literal("hazmat"),
  v.literal("water-rescue"),
  v.literal("training"),
  v.literal("personnel"),
  v.literal("apparatus"),
  v.literal("station"),
  v.literal("grants-legislation"),
  v.literal("memorial"),
  v.literal("community"),
  v.literal("other"),
);

export const CATEGORY_LABELS: Record<Category, string> = {
  "structure-fire": "Structure Fire",
  "brush-fire": "Brush Fire",
  "mva-rescue": "MVA / Rescue",
  ems: "EMS",
  hazmat: "Hazmat",
  "water-rescue": "Water Rescue",
  training: "Training",
  personnel: "Personnel",
  apparatus: "Apparatus",
  station: "Station",
  "grants-legislation": "Grants & Legislation",
  memorial: "Memorial",
  community: "Community",
  other: "Other",
};

export const VERIFICATION_LEVELS = [
  "automated",
  "official",
  "developing",
  "confirmed",
  "verified",
] as const;
export type Verification = (typeof VERIFICATION_LEVELS)[number];

export const verificationValidator = v.union(
  v.literal("automated"),
  v.literal("official"),
  v.literal("developing"),
  v.literal("confirmed"),
  v.literal("verified"),
);

export const VERIFICATION_LABELS: Record<Verification, string> = {
  automated: "Automated Alert",
  official: "Official Department Update",
  developing: "Developing",
  confirmed: "Confirmed by Department",
  verified: "Editorially Verified",
};

export const ALERT_STATUSES = ["published", "pending", "rejected"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export const alertStatusValidator = v.union(
  v.literal("published"),
  v.literal("pending"),
  v.literal("rejected"),
);

export const actorValidator = v.union(
  v.literal("system"),
  v.literal("editor"),
);

export const MIN_TRUST_LEVEL = 1;
export const MAX_TRUST_LEVEL = 4;
