import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (user !== null) {
      // Update name/email if changed
      const updates: { name?: string; email?: string } = {};
      if (identity.name && identity.name !== user.name) updates.name = identity.name;
      if (identity.email && identity.email !== user.email) updates.email = identity.email;
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
      }
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
      isVerified: false,
      phoneVerified: false,
      rating: 0,
      ratingCount: 0,
      role: "user",
      joinedAt: new Date().toISOString(),
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    // Return safe public fields only
    return {
      _id: user._id,
      name: user.name,
      bio: user.bio,
      city: user.city,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      rating: user.rating,
      ratingCount: user.ratingCount,
      joinedAt: user.joinedAt,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "يجب تسجيل الدخول" });

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });

    const updates: {
      name?: string;
      bio?: string;
      city?: string;
      region?: string;
      avatarUrl?: string;
    } = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.city !== undefined) updates.city = args.city;
    if (args.region !== undefined) updates.region = args.region;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});
