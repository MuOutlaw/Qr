"use node";

import { action } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "../_generated/api.js";

const AUTHENTICA_BASE = "https://api.authentica.sa";

function normalizePhone(phone: string): string {
  const clean = phone.replace(/\s/g, "");
  if (/^05\d{8}$/.test(clean)) return "+966" + clean.slice(1);
  if (/^\+9665\d{8}$/.test(clean)) return clean;
  if (/^9665\d{8}$/.test(clean)) return "+" + clean;
  if (/^5\d{8}$/.test(clean)) return "+966" + clean;
  return clean;
}

/** Send OTP via Authentica for login/signup */
export const sendLoginOTP = action({
  args: { phone: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; phone: string }> => {
    const apiKey = process.env.apikay;
    if (!apiKey) {
      throw new ConvexError({ code: "EXTERNAL_SERVICE_ERROR", message: "خدمة الرسائل غير مُعيَّنة" });
    }

    const normalized = normalizePhone(args.phone);
    if (!/^\+9665\d{8}$/.test(normalized)) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "رقم الجوال غير صالح" });
    }

    const res = await fetch(`${AUTHENTICA_BASE}/api/v2/send-otp`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Authorization": apiKey,
      },
      body: JSON.stringify({
        method: "sms",
        phone: normalized,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Authentica send-otp error:", res.status, errText);
      throw new ConvexError({ code: "EXTERNAL_SERVICE_ERROR", message: "فشل إرسال رمز التحقق، تأكد من الرقم وحاول مرة أخرى" });
    }

    return { success: true, phone: normalized };
  },
});

/** Verify OTP and create/login user */
export const verifyLoginOTP = action({
  args: { phone: v.string(), code: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; sessionToken: string; userId: string }> => {
    const apiKey = process.env.apikay;
    if (!apiKey) {
      throw new ConvexError({ code: "EXTERNAL_SERVICE_ERROR", message: "خدمة الرسائل غير مُعيَّنة" });
    }

    const normalized = normalizePhone(args.phone);

    const res = await fetch(`${AUTHENTICA_BASE}/api/v2/verify-otp`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Authorization": apiKey,
      },
      body: JSON.stringify({
        phone: normalized,
        otp: args.code,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      console.error("Authentica verify-otp error:", res.status, body);
      const msg = res.status === 400
        ? "رمز التحقق غير صحيح أو انتهت صلاحيته"
        : "حدث خطأ أثناء التحقق، حاول مرة أخرى";
      throw new ConvexError({ code: "BAD_REQUEST", message: msg });
    }

    // Create or get user and create session
    const result = await ctx.runMutation(internal.auth.mutations.createOrLoginUser, {
      phone: normalized,
    });

    return {
      success: true,
      sessionToken: result.sessionToken,
      userId: result.userId,
    };
  },
});

/** Validate existing session token */
export const validateSession = action({
  args: { sessionToken: v.string() },
  handler: async (ctx, args): Promise<{ valid: boolean; userId?: string }> => {
    const result = await ctx.runQuery(internal.auth.queries.getSessionByToken, {
      sessionToken: args.sessionToken,
    });

    if (!result) {
      return { valid: false };
    }

    // Check if session is expired
    if (new Date(result.expiresAt) < new Date()) {
      return { valid: false };
    }

    return { valid: true, userId: result.userId };
  },
});

/** Logout - invalidate session */
export const logout = action({
  args: { sessionToken: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    await ctx.runMutation(internal.auth.mutations.deleteSession, {
      sessionToken: args.sessionToken,
    });
    return { success: true };
  },
});
