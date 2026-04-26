import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// Generate a secure random session token
function generateSessionToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Phones that get admin role
const ADMIN_PHONES = ["+966500000000"]; // Add admin phone numbers here

/** Create user if not exists, create session, return token */
export const createOrLoginUser = internalMutation({
  args: { phone: v.string() },
  handler: async (ctx, args): Promise<{ sessionToken: string; userId: string }> => {
    // Find or create user by phone
    let user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();

    if (!user) {
      // Create new user with phone as tokenIdentifier
      const isAdmin = ADMIN_PHONES.includes(args.phone);
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: `phone:${args.phone}`,
        phone: args.phone,
        phoneVerified: true,
        isVerified: false,
        rating: 0,
        ratingCount: 0,
        role: isAdmin ? "admin" : "user",
        joinedAt: new Date().toISOString(),
      });
      user = await ctx.db.get(userId);
    } else {
      // Update phone verification status
      await ctx.db.patch(user._id, {
        phoneVerified: true,
      });
    }

    // Delete any existing sessions for this user
    const existingSessions = await ctx.db
      .query("authSessions")
      .withIndex("by_user", (q) => q.eq("userId", user!._id))
      .collect();
    
    for (const session of existingSessions) {
      await ctx.db.delete(session._id);
    }

    // Create new session (30 days expiry)
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await ctx.db.insert("authSessions", {
      phone: args.phone,
      sessionToken,
      userId: user!._id,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

    return {
      sessionToken,
      userId: user!._id as string,
    };
  },
});

/** Delete a session by token */
export const deleteSession = internalMutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args): Promise<void> => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

/** Delete all sessions for a user */
export const deleteUserSessions = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<void> => {
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
  },
});

/** Refresh session expiry */
export const refreshSession = internalMutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();

    if (!session) return false;

    // Extend expiry by 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await ctx.db.patch(session._id, {
      expiresAt: expiresAt.toISOString(),
    });

    return true;
  },
});
