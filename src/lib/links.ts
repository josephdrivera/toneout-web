// Central place for external destination links.

export const APP_STORE_URL =
  "https://apps.apple.com/us/app/toneout/id6762690616";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.toneout.android";

/**
 * The Android launch switch. Leave null until ToneOut is publicly live on
 * Google Play, then set it to the launch date as it should read on the site
 * (e.g. "November 20, 2026"). Setting it swaps the homepage waitlist for a
 * Google Play button, publishes the launch post, and flips the support and
 * roadmap copy from "coming" to "live".
 */
export const ANDROID_LAUNCH_DATE: string | null = "November 20, 2026";

export const ANDROID_LIVE = ANDROID_LAUNCH_DATE !== null;
