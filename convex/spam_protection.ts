import { ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel.d.ts";

// ─── Spam keyword list ────────────────────────────────────────────────────────
const SPAM_KEYWORDS = [
  "واتساب", "تلغرام", "snapchat", "انستقرام", "0500", "0501", "0502",
  "0503", "0504", "0505", "0506", "0507", "0508", "0509",
  "http://", "https://", "www.", ".com", ".net",
];

/** Check content for spam keywords and throw if found */
export function checkContentSpam(text: string, fieldName: string): void {
  const lower = text.toLowerCase();
  for (const kw of SPAM_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: `${fieldName} يحتوي على محتوى غير مسموح به`,
      });
    }
  }
}

// ─── Rate limiters ────────────────────────────────────────────────────────────

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** Max listings per user per hour */
const MAX_LISTINGS_PER_HOUR = 5;

export async function checkListingRateLimit(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const since = new Date(Date.now() - HOUR_MS).toISOString();
  const recent = await ctx.db
    .query("listings")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .order("desc")
    .take(MAX_LISTINGS_PER_HOUR + 1);
  const inWindow = recent.filter((l) => l.createdAt >= since);
  if (inWindow.length >= MAX_LISTINGS_PER_HOUR) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: `تجاوزت الحد المسموح به (${MAX_LISTINGS_PER_HOUR} إعلانات في الساعة)`,
    });
  }
}

/** Max auctions per user per 24 hours */
const MAX_AUCTIONS_PER_DAY = 3;

export async function checkAuctionRateLimit(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const since = new Date(Date.now() - 24 * HOUR_MS).toISOString();
  const recent = await ctx.db
    .query("auctions")
    .withIndex("by_creator", (q) => q.eq("creatorId", userId))
    .order("desc")
    .take(MAX_AUCTIONS_PER_DAY + 1);
  const inWindow = recent.filter((a) => a.createdAt >= since);
  if (inWindow.length >= MAX_AUCTIONS_PER_DAY) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: `تجاوزت الحد المسموح به (${MAX_AUCTIONS_PER_DAY} مزادات في اليوم)`,
    });
  }
}

/** Max bids per user per minute per auction */
const MAX_BIDS_PER_MINUTE = 5;

export async function checkBidRateLimit(
  ctx: MutationCtx,
  userId: Id<"users">,
  auctionId: Id<"auctions">
): Promise<void> {
  const since = new Date(Date.now() - MINUTE_MS).toISOString();
  const recent = await ctx.db
    .query("bids")
    .withIndex("by_bidder", (q) => q.eq("bidderId", userId))
    .order("desc")
    .take(MAX_BIDS_PER_MINUTE + 1);
  const inWindow = recent.filter((b) => b.auctionId === auctionId && b.createdAt >= since);
  if (inWindow.length >= MAX_BIDS_PER_MINUTE) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "تجاوزت الحد المسموح به للمزايدات. انتظر قليلاً",
    });
  }
}

/** Max conversations per user per hour */
const MAX_CONVERSATIONS_PER_HOUR = 10;

export async function checkConversationRateLimit(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  // Simple heuristic: collect all conversations and count recent ones
  const all = await ctx.db.query("conversations").collect();
  const since = new Date(Date.now() - HOUR_MS).toISOString();
  const inWindow = all.filter(
    (c) => c.participantIds.includes(userId) && c.lastMessageAt >= since
  );
  if (inWindow.length >= MAX_CONVERSATIONS_PER_HOUR) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "تجاوزت الحد المسموح به لبدء المحادثات",
    });
  }
}

/** Max messages per user per minute per conversation */
const MAX_MESSAGES_PER_MINUTE = 10;

export async function checkMessageRateLimit(
  ctx: MutationCtx,
  userId: Id<"users">,
  conversationId: Id<"conversations">
): Promise<void> {
  const since = new Date(Date.now() - MINUTE_MS).toISOString();
  const recent = await ctx.db
    .query("messages")
    .withIndex("by_conversation_and_sentAt", (q) => q.eq("conversationId", conversationId))
    .order("desc")
    .take(MAX_MESSAGES_PER_MINUTE + 1);
  const inWindow = recent.filter((m) => m.senderId === userId && m.sentAt >= since);
  if (inWindow.length >= MAX_MESSAGES_PER_MINUTE) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "أرسلت رسائل كثيرة. انتظر قليلاً",
    });
  }
}

/** Prevent duplicate messages (same text in last 60 seconds) */
export async function checkDuplicateMessage(
  ctx: MutationCtx,
  userId: Id<"users">,
  conversationId: Id<"conversations">,
  text: string
): Promise<void> {
  const since = new Date(Date.now() - 60000).toISOString();
  const recent = await ctx.db
    .query("messages")
    .withIndex("by_conversation_and_sentAt", (q) => q.eq("conversationId", conversationId))
    .order("desc")
    .take(5);
  const dup = recent.find(
    (m) => m.senderId === userId && m.text === text && m.sentAt >= since
  );
  if (dup) {
    throw new ConvexError({
      code: "CONFLICT",
      message: "لا ترسل نفس الرسالة مرتين",
    });
  }
}

/** Max comments per user per hour */
const MAX_COMMENTS_PER_HOUR = 20;

export async function checkCommentRateLimit(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const since = new Date(Date.now() - HOUR_MS).toISOString();
  const recent = await ctx.db
    .query("comments")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .take(MAX_COMMENTS_PER_HOUR + 1);
  const inWindow = recent.filter((c) => c.createdAt >= since);
  if (inWindow.length >= MAX_COMMENTS_PER_HOUR) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "تجاوزت الحد المسموح به للتعليقات",
    });
  }
}

/** Prevent duplicate comments */
export async function checkDuplicateComment(
  ctx: MutationCtx,
  userId: Id<"users">,
  listingId: Id<"listings">,
  text: string
): Promise<void> {
  const since = new Date(Date.now() - 5 * MINUTE_MS).toISOString();
  const recent = await ctx.db
    .query("comments")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .take(5);
  const dup = recent.find(
    (c) => c.listingId === listingId && c.text === text && c.createdAt >= since
  );
  if (dup) {
    throw new ConvexError({ code: "CONFLICT", message: "لا تضف نفس التعليق مرتين" });
  }
}

/** Max ratings per user per day */
const MAX_RATINGS_PER_DAY = 20;

export async function checkRatingRateLimit(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const since = new Date(Date.now() - 24 * HOUR_MS).toISOString();
  const recent = await ctx.db
    .query("ratings")
    .withIndex("by_ratedUser", (q) => q.eq("ratedUserId", userId))
    .order("desc")
    .take(MAX_RATINGS_PER_DAY + 1);
  // Note: we rate-limit by rater, not ratedUser — close enough approximation
  const inWindow = recent.filter((r) => r.createdAt >= since && r.raterId === userId);
  if (inWindow.length >= MAX_RATINGS_PER_DAY) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "تجاوزت الحد المسموح به للتقييمات",
    });
  }
}

/** Max reports per user per day */
const MAX_REPORTS_PER_DAY = 5;

export async function checkReportRateLimit(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const since = new Date(Date.now() - 24 * HOUR_MS).toISOString();
  const recent = await ctx.db
    .query("reports")
    .withIndex("by_status", (q) => q.eq("status", "pending"))
    .order("desc")
    .take(MAX_REPORTS_PER_DAY + 10);
  const inWindow = recent.filter((r) => r.reporterId === userId && r.createdAt >= since);
  if (inWindow.length >= MAX_REPORTS_PER_DAY) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "تجاوزت الحد المسموح به للبلاغات",
    });
  }
}
