import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../auth-context";
import { ApiError } from "@/lib/api/types";
import * as apiClient from "@/lib/api/client";

function TestConsumer() {
  const { user, status, error, logout, loginWithGoogle } = useAuth();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="user">{user ? user.name : "none"}</div>
      <div data-testid="error">{error ?? "no-error"}</div>
      <button onClick={() => void logout()}>Logout</button>
      <button onClick={loginWithGoogle}>Login Google</button>
    </div>
  );
}

describe("AuthProvider & useAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles initial loading then authenticated state on 200", async () => {
    const mockUser = {
      id: 1,
      name: "Jane Citizen",
      email: "jane@example.com",
      role: "citizen",
      status: "active",
    };

    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("status").textContent).toBe("loading");

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
    });

    expect(screen.getByTestId("user").textContent).toBe("Jane Citizen");
  });

  it("handles unauthenticated state on 401 cleanly without error status", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(
      new ApiError(401, "Unauthenticated.")
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    });

    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(screen.getByTestId("error").textContent).toBe("no-error");
  });

  it("handles server error 500 distinctly from unauthenticated", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(
      new ApiError(500, "Internal Server Error")
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("error");
    });

    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(screen.getByTestId("error").textContent).toContain("Internal Server Error");
  });

  it("handles logout successfully and clears user state", async () => {
    const mockUser = {
      id: 1,
      name: "Jane Citizen",
      email: "jane@example.com",
      role: "citizen",
      status: "active",
    };

    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue(mockUser);
    const initCsrfSpy = vi.spyOn(apiClient, "initCsrf").mockResolvedValue();
    const logoutSpy = vi.spyOn(apiClient, "logout").mockResolvedValue();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
    });

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(initCsrfSpy).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalled();
    expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("transitions to unauthenticated when logout receives 401", async () => {
    const mockUser = {
      id: 1,
      name: "Jane Citizen",
      email: "jane@example.com",
      role: "citizen",
      status: "active",
    };

    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue(mockUser);
    vi.spyOn(apiClient, "initCsrf").mockResolvedValue();
    vi.spyOn(apiClient, "logout").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
    });

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });
});
