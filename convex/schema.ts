import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Users ───────────────────────────────────────────────────
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerified: v.optional(v.boolean()),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    rating: v.optional(v.number()),
    ratingCount: v.optional(v.number()),
    joinedAt: v.optional(v.string()),
    // Subscription
    subscriptionPackage: v.optional(v.string()),
    subscriptionExpiresAt: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_phone", ["phone"]),

  // ─── Listings ─────────────────────────────────────────────────
  listings: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    priceType: v.union(v.literal("fixed"), v.literal("negotiable")),
    category: v.string(),
    subCategory: v.optional(v.string()),
    city: v.string(),
    region: v.optional(v.string()),
    images: v.array(v.string()),
    videoStorageId: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("sold"), v.literal("draft")),
    isFeatured: v.boolean(),
    views: v.number(),
    // Livestock-specific fields
    age: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("mixed"))),
    quantity: v.optional(v.number()),
    weight: v.optional(v.string()),
    breed: v.optional(v.string()),
    commissionPaid: v.optional(v.boolean()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_status_and_category", ["status", "category"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "category"],
    }),

  // ─── Auctions ─────────────────────────────────────────────────
  auctions: defineTable({
    creatorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    category: v.string(),
    city: v.string(),
    startingPrice: v.number(),
    minBidIncrement: v.number(),
    currentPrice: v.number(),
    highestBidderId: v.optional(v.id("users")),
    bidCount: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("active"),
      v.literal("ended"),
      v.literal("cancelled")
    ),
    createdAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_creator", ["creatorId"]),

  // ─── Bids ─────────────────────────────────────────────────────
  bids: defineTable({
    auctionId: v.id("auctions"),
    bidderId: v.id("users"),
    amount: v.number(),
    createdAt: v.string(),
  })
    .index("by_auction", ["auctionId"])
    .index("by_bidder", ["bidderId"]),

  // ─── Live Streams ─────────────────────────────────────────────
  liveStreams: defineTable({
    auctionId: v.id("auctions"),
    hostId: v.id("users"),
    channelName: v.string(),
    status: v.union(v.literal("live"), v.literal("ended")),
    viewerCount: v.number(),
    startedAt: v.string(),
    endedAt: v.optional(v.string()),
  })
    .index("by_auction", ["auctionId"])
    .index("by_status", ["status"])
    .index("by_host", ["hostId"]),

  // ─── Conversations ────────────────────────────────────────────
  conversations: defineTable({
    participantIds: v.array(v.id("users")),
    listingId: v.optional(v.id("listings")),
    lastMessageAt: v.string(),
    lastMessageText: v.optional(v.string()),
    unreadCounts: v.record(v.string(), v.number()),
  }).index("by_listing", ["listingId"]),

  // ─── Messages ─────────────────────────────────────────────────
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
    isRead: v.boolean(),
    sentAt: v.string(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_and_sentAt", ["conversationId", "sentAt"]),

  // ─── Notifications ────────────────────────────────────────────
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("new_message"),
      v.literal("new_rating"),
      v.literal("listing_saved"),
      v.literal("listing_sold"),
      v.literal("boost_expired"),
      v.literal("listing_inquiry")
    ),
    title: v.string(),
    body: v.string(),
    isRead: v.boolean(),
    listingId: v.optional(v.id("listings")),
    conversationId: v.optional(v.id("conversations")),
    actorId: v.optional(v.id("users")),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_isRead", ["userId", "isRead"]),

  // ─── Ratings ──────────────────────────────────────────────────
  ratings: defineTable({
    raterId: v.id("users"),
    ratedUserId: v.id("users"),
    listingId: v.optional(v.id("listings")),
    score: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_ratedUser", ["ratedUserId"])
    .index("by_ratedUser_and_rater", ["ratedUserId", "raterId"]),

  // ─── Comments ─────────────────────────────────────────────────
  comments: defineTable({
    listingId: v.id("listings"),
    userId: v.id("users"),
    text: v.string(),
    createdAt: v.string(),
  })
    .index("by_listing", ["listingId"])
    .index("by_user", ["userId"]),

  // ─── Reports ──────────────────────────────────────────────────
  reports: defineTable({
    reporterId: v.id("users"),
    targetType: v.union(v.literal("listing"), v.literal("user")),
    targetListingId: v.optional(v.id("listings")),
    targetUserId: v.optional(v.id("users")),
    reason: v.union(
      v.literal("spam"),
      v.literal("fraud"),
      v.literal("inappropriate"),
      v.literal("wrong_category"),
      v.literal("fake_price"),
      v.literal("other")
    ),
    details: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("resolved"), v.literal("dismissed")),
    createdAt: v.string(),
  })
    .index("by_target_listing", ["targetListingId"])
    .index("by_target_user", ["targetUserId"])
    .index("by_status", ["status"]),

  // ─── Boosts ───────────────────────────────────────────────────
  boosts: defineTable({
    listingId: v.id("listings"),
    userId: v.id("users"),
    packageId: v.string(),
    startsAt: v.string(),
    expiresAt: v.string(),
    isActive: v.boolean(),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("free")),
    checkoutSessionId: v.optional(v.string()),
  })
    .index("by_listing", ["listingId"])
    .index("by_active", ["isActive"])
    .index("by_user", ["userId"]),

  // ─── Payments ─────────────────────────────────────────────────
  payments: defineTable({
    userId: v.id("users"),
    paymentId: v.string(),
    type: v.union(v.literal("subscription"), v.literal("boost"), v.literal("commission")),
    amountSar: v.number(),
    packageId: v.optional(v.string()),
    listingId: v.optional(v.id("listings")),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
    paidAt: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_paymentId", ["paymentId"]),

  // ─── Subscription Receipts ────────────────────────────────────
  subscriptionReceipts: defineTable({
    userId: v.id("users"),
    receiptStorageId: v.id("_storage"),
    packageId: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // ─── Verification Requests ────────────────────────────────────
  verificationRequests: defineTable({
    userId: v.id("users"),
    idType: v.union(
      v.literal("national_id"),
      v.literal("iqama"),
      v.literal("commercial_register")
    ),
    idNumber: v.string(),
    idImageStorageId: v.id("_storage"),
    selfieStorageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // ─── Saved Listings (Favorites) ──────────────────────────────
  savedListings: defineTable({
    userId: v.id("users"),
    listingId: v.id("listings"),
    savedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_listing", ["listingId"])
    .index("by_user_and_listing", ["userId", "listingId"]),

  // ─── Audit Logs ───────────────────────────────────────────────
  auditLogs: defineTable({
    userId: v.id("users"),
    eventType: v.union(
      v.literal("seller_auction_consent"),
      v.literal("bidder_auction_consent"),
      v.literal("winner_purchase_confirm"),
      v.literal("bid_placed"),
      v.literal("auction_created"),
      v.literal("auction_ended"),
      v.literal("auction_cancelled")
    ),
    auctionId: v.optional(v.id("auctions")),
    consentText: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_auction", ["auctionId"]),
});
