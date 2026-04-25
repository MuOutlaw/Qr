"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { RtcTokenBuilder, RtcRole } from "agora-token";

/** Generate an Agora RTC token for joining a live stream channel */
export const generateToken = action({
  args: {
    channelName: v.string(),
    uid: v.number(),
    role: v.union(v.literal("publisher"), v.literal("subscriber")),
  },
  handler: async (_ctx, args): Promise<{ token: string; appId: string }> => {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "مفاتيح Agora غير مهيأة. يرجى إضافة AGORA_APP_ID و AGORA_APP_CERTIFICATE في الإعدادات.",
      });
    }

    const role = args.role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    // Token valid for 1 hour
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      args.channelName,
      args.uid,
      role,
      privilegeExpiredTs,
      privilegeExpiredTs,
    );

    return { token, appId };
  },
});
