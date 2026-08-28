import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "../protected-route";
import * as authContext from "@/lib/auth/auth-context";

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading status when auth is loading and does not render children", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: null,
      status: "loading",
      error: null,
      refreshUser: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.queryByText("Secret Content")).toBeNull();
  });

  it("redirects and renders fallback when unauthenticated", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: null,
      status: "unauthenticated",
      error: null,
      refreshUser: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <ProtectedRoute fallback={<div>Please Sign In</div>}>
        <div>Secret Content</div>
      </ProtectedRoute>
    );

    expect(mockReplace).toHaveBeenCalledWith("/");
    expect(screen.getByText("Please Sign In")).toBeDefined();
    expect(screen.queryByText("Secret Content")).toBeNull();
  });

  it("renders protected content when user is authenticated", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: {
        id: 1,
        name: "Jane Citizen",
        email: "jane@example.com",
        role: "citizen",
        status: "active",
      },
      status: "authenticated",
      error: null,
      refreshUser: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Secret Content")).toBeDefined();
  });

  it("renders unauthorized notice when requiredRole does not match", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: {
        id: 1,
        name: "Jane Citizen",
        email: "jane@example.com",
        role: "citizen",
        status: "active",
      },
      status: "authenticated",
      error: null,
      refreshUser: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Panel</div>
      </ProtectedRoute>
    );

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.queryByText("Admin Panel")).toBeNull();
  });
});
