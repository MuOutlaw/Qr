import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type Ctx = MutationCtx | QueryCtx;

/** Get current authenticated user or throw UNAUTHENTICATED */
export async function getCurrentUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "يجب تسجيل الدخول" });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) {
    throw new ConvexError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
  }
  return user;
}

/** Require the current user to have admin role */
export async function requireAdmin(ctx: Ctx) {
  const user = await getCurrentUser(ctx);
  if (user.role !== "admin") {
    throw new ConvexError({ code: "FORBIDDEN", message: "غير مصرح — يجب أن تكون مسؤولاً" });
  }
  return user;
}
