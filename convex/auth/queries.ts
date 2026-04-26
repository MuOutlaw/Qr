import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";

/** Get session by token (internal) */
export const getSessionByToken = internalQuery({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();

    if (!session) return null;

    return {
      userId: session.userId as string,
      phone: session.phone,
      expiresAt: session.expiresAt,
    };
  },
});

/** Get user by session token (public query for frontend) */
export const getUserBySessionToken = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();

    if (!session) return null;

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      bio: user.bio,
      city: user.city,
      region: user.region,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      role: user.role,
      rating: user.rating,
      ratingCount: user.ratingCount,
      joinedAt: user.joinedAt,
      subscriptionPackage: user.subscriptionPackage,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      verificationStatus: user.verificationStatus,
      agreedToStreamTerms: user.agreedToStreamTerms,
    };
  },
});

/** Get current user by phone (for tokenIdentifier-based auth) */
export const getUserByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();

    if (!user) return null;

    return {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      isVerified: user.isVerified,
      role: user.role,
    };
  },
});
