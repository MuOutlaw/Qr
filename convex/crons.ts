import { cronJobs } from "convex/server";
import { internal } from "./_generated/api.js";

const crons = cronJobs();

// Process auction status transitions every minute
crons.interval(
  "process auction statuses",
  { minutes: 1 },
  internal.auctions.internals.processAuctionStatuses
);

// Expire old boosts every hour
crons.interval(
  "expire old boosts",
  { hours: 1 },
  internal.boosts.mutations.expireOldBoosts
);

export default crons;
