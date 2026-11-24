import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "poll news sources",
  { minutes: 5 },
  internal.ingest.pollDueSources,
  {},
);

// Apple posts yesterday's sales report during the morning (US time); the
// second run catches late reports and corrections.
crons.cron(
  "pull App Store stats",
  "20 14,22 * * *",
  internal.appStore.pull,
  {},
);

export default crons;
