import { mutation, query } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUser } from "../helpers.ts";

/** Submit identity verification request */
export const submitVerification = mutation({
  args: {
    idImageUrl: v.string(),
    idType: v.union(v.literal("national_id"), v.literal("residence")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (user.verificationStatus === "approved") {
      throw new ConvexError({ code: "CONFLICT", message: "حسابك موثق بالفعل" });
    }
    if (user.verificationStatus === "pending") {
      throw new ConvexError({ code: "CONFLICT", message: "طلب التوثيق قيد المراجعة بالفعل" });
    }

    await ctx.db.patch(user._id, {
      verificationStatus: "pending",
      verificationIdImageId: args.idImageUrl,
      verificationIdType: args.idType,
      verificationSubmittedAt: new Date().toISOString(),
      verificationRejectionReason: undefined,
    });

    return { success: true };
  },
});

/** Mark phone as OTP verified */
export const markPhoneVerified = mutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      phone: args.phone,
      phoneOtpVerified: true,
    });
    return { success: true };
  },
});

/** Agree to streaming terms */
export const agreeToStreamTerms = mutation({
  args: {},
  handler: async (ctx): Promise<{ success: boolean }> => {
    const user = await getCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      agreedToStreamTerms: true,
      streamTermsAgreedAt: new Date().toISOString(),
    });
    return { success: true };
  },
});

/** Get current user's verification status */
export const getVerificationStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    return {
      verificationStatus: user.verificationStatus ?? "none",
      phoneOtpVerified: user.phoneOtpVerified ?? false,
      agreedToStreamTerms: user.agreedToStreamTerms ?? false,
      phone: user.phone,
      rejectionReason: user.verificationRejectionReason,
    };
  },
});

/** Admin: approve or reject verification */
export const reviewVerification = mutation({
  args: {
    userId: v.id("users"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentUser(ctx);
    if (admin.role !== "admin") {
      throw new ConvexError({ code: "FORBIDDEN", message: "غير مصرح" });
    }

    const updates =
      args.action === "approve"
        ? {
            verificationStatus: "approved" as const,
            isVerified: true,
            verificationReviewedAt: new Date().toISOString(),
          }
        : {
            verificationStatus: "rejected" as const,
            isVerified: false,
            verificationReviewedAt: new Date().toISOString(),
            verificationRejectionReason: args.reason ?? "تم رفض الطلب",
          };

    await ctx.db.patch(args.userId, updates);
    return { success: true };
  },
});

/** Admin: list pending verification requests */
export const listPendingVerifications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const admin = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!admin || admin.role !== "admin") return [];

    const pending = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("verificationStatus"), "pending"))
      .collect();

    return pending.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      idType: u.verificationIdType,
      idImageUrl: u.verificationIdImageId,
      submittedAt: u.verificationSubmittedAt,
    }));
  },
});
