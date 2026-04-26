import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Only renders children if the user is authenticated
 */
export function Authenticated({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback ?? null;
  }

  if (!isAuthenticated) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

/**
 * Only renders children if the user is NOT authenticated
 */
export function Unauthenticated({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback ?? null;
  }

  if (isAuthenticated) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

/**
 * Renders loading fallback while auth state is being determined
 */
export function AuthLoading({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

  if (!isLoading) {
    return null;
  }

  return <>{children}</>;
}
