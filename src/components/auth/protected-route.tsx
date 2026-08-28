"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/",
  fallback,
}: ProtectedRouteProps) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || status === "error") {
      router.replace(redirectTo);
    }
  }, [status, router, redirectTo]);

  if (status === "loading") {
    return (
      <div role="status" className="flex items-center justify-center p-8 text-sm text-[#57524d]">
        <span>Verifying authentication...</span>
      </div>
    );
  }

  if (status === "unauthenticated" || status === "error" || !user) {
    return fallback ?? null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div role="alert" className="p-6 text-sm text-red-700 bg-red-50 rounded-lg">
        <span>You do not have the required permissions to view this content.</span>
      </div>
    );
  }

  return <>{children}</>;
}
