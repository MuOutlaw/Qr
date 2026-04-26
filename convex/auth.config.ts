import { AuthConfig } from "convex/server";

// OTP-based authentication - no external OIDC provider needed
// Sessions are managed via authSessions table
export default {
  providers: [],
} satisfies AuthConfig;
