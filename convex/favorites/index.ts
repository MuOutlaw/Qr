import { query, mutation } from "../_generated/server";
import { v, ConvexError } from "convex/values";

export const toggleSave = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args): Promise<{ saved: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "يجب تسجيل الدخول" });

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });

    const existing = await ctx.db
      .query("savedListings")
      .withIndex("by_user_and_listing", (q) =>
        q.eq("userId", user._id).eq("listingId", args.listingId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    } else {
      await ctx.db.insert("savedListings", {
        userId: user._id,
        listingId: args.listingId,
        savedAt: new Date().toISOString(),
      });
      return { saved: true };
    }
  },
});

export const getMySaved = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];

    const saves = await ctx.db
      .query("savedListings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      saves.map(async (s) => {
        const listing = await ctx.db.get(s.listingId);
        if (!listing) return null;
        const seller = await ctx.db.get(listing.userId);
        return {
          ...s,
          listing: {
            ...listing,
            seller: seller
              ? { name: seller.name, isVerified: seller.isVerified, rating: seller.rating }
              : null,
          },
        };
      })
    );

    return enriched.filter((s): s is NonNullable<typeof s> => s !== null);
  },
});

export const isSaved = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args): Promise<boolean> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return false;

    const existing = await ctx.db
      .query("savedListings")
      .withIndex("by_user_and_listing", (q) =>
        q.eq("userId", user._id).eq("listingId", args.listingId)
      )
      .unique();

    return existing !== null;
  },
});
