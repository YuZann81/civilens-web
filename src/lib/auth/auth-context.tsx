"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { AuthUser, ApiError, LoginCredentials, RegisterData, RegisterResponseData } from "@/lib/api/types";
import {
  getAuthUser,
  initCsrf,
  logout as apiLogout,
  login as apiLogin,
  register as apiRegister,
  getGoogleOAuthUrl,
} from "@/lib/api/client";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

export interface ResetAuthSession {
  email: string;
  token: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  resetAuthSession: ResetAuthSession | null;
  setResetAuthSession: (session: ResetAuthSession | null) => void;
  clearResetAuthSession: () => void;
  refreshUser: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<RegisterResponseData>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [resetAuthSession, setResetAuthSession] = useState<ResetAuthSession | null>(null);
  const initializingRef = useRef(false);

  const clearResetAuthSession = useCallback(() => {
    setResetAuthSession(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const authUser = await getAuthUser();
      setUser(authUser);
      setStatus("authenticated");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setStatus("unauthenticated");
      } else {
        const message = err instanceof Error ? err.message : "Failed to authenticate";
        setUser(null);
        setError(message);
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    try {
      setError(null);
      const authUser = await apiLogin(credentials);
      setUser(authUser);
      setStatus("authenticated");
      return authUser;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Login failed");
      }
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<RegisterResponseData> => {
    try {
      setError(null);
      const result = await apiRegister(data);
      if (result.user) {
        setUser(result.user);
        setStatus("authenticated");
      }
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Registration failed");
      }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await initCsrf();
      await apiLogout();
      setUser(null);
      setError(null);
      setStatus("unauthenticated");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setError(null);
        setStatus("unauthenticated");
      } else {
        const message = err instanceof Error ? err.message : "Logout failed";
        setError(message);
        throw err;
      }
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    window.location.href = getGoogleOAuthUrl();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        resetAuthSession,
        setResetAuthSession,
        clearResetAuthSession,
        refreshUser,
        login,
        register,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
