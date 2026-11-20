import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "poll news sources",
  { minutes: 5 },
  internal.ingest.pollDueSources,
  {},
);

export default crons;
