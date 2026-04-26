import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

const SESSION_TOKEN_KEY = "safat_session_token";

interface User {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneVerified?: boolean;
  bio?: string;
  city?: string;
  region?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  role?: "user" | "admin";
  rating?: number;
  ratingCount?: number;
  joinedAt?: string;
  subscriptionPackage?: string;
  subscriptionExpiresAt?: string;
  verificationStatus?: "pending" | "approved" | "rejected";
  agreedToStreamTerms?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionToken: string | null;
  login: (sessionToken: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function OTPAuthProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SESSION_TOKEN_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const logoutAction = useAction(api.auth.actions.logout);

  // Query user by session token
  const user = useQuery(
    api.auth.queries.getUserBySessionToken,
    sessionToken ? { sessionToken } : "skip"
  );

  // Handle session validation
  useEffect(() => {
    if (sessionToken) {
      // If user query returned null, session is invalid
      if (user === null) {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        setSessionToken(null);
      }
    }
    setIsLoading(false);
  }, [user, sessionToken]);

  const login = useCallback((token: string) => {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    setSessionToken(token);
  }, []);

  const logout = useCallback(async () => {
    if (sessionToken) {
      try {
        await logoutAction({ sessionToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem(SESSION_TOKEN_KEY);
    setSessionToken(null);
  }, [sessionToken, logoutAction]);

  const refreshUser = useCallback(() => {
    // Trigger a re-fetch by briefly removing and re-adding the token
    const token = sessionToken;
    if (token) {
      setSessionToken(null);
      setTimeout(() => setSessionToken(token), 0);
    }
  }, [sessionToken]);

  const value: AuthContextType = {
    user: user as User | null,
    isLoading: isLoading || user === undefined,
    isAuthenticated: !!user,
    sessionToken,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an OTPAuthProvider");
  }
  return context;
}

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}
