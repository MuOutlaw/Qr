import { OTPAuthProvider as AuthProvider } from "@/contexts/auth-context";

export function OTPAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
