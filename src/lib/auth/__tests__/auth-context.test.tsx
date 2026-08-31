import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../auth-context";
import { ApiError } from "@/lib/api/types";
import * as apiClient from "@/lib/api/client";

function TestConsumer() {
  const {
    user,
    status,
    error,
    resetAuthSession,
    setResetAuthSession,
    clearResetAuthSession,
    login,
    register,
    logout,
    loginWithGoogle,
  } = useAuth();

  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="user">{user ? user.name : "none"}</div>
      <div data-testid="error">{error ?? "no-error"}</div>
      <div data-testid="reset-auth">{resetAuthSession ? resetAuthSession.email : "none"}</div>
      <button
        onClick={() =>
          setResetAuthSession({ email: "user@example.com", token: "secret-token-64" })
        }
      >
        Set Reset Auth
      </button>
      <button onClick={clearResetAuthSession}>Clear Reset Auth</button>
      <button onClick={() => void login({ email: "test@example.com", password: "password123" })}>
        Login
      </button>
      <button
        onClick={() =>
          void register({
            name: "New Citizen",
            email: "new@example.com",
            password: "password123",
            password_confirmation: "password123",
          })
        }
      >
        Register
      </button>
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

  it("manages temporary in-memory resetAuthSession state", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    });

    expect(screen.getByTestId("reset-auth").textContent).toBe("none");

    act(() => {
      screen.getByText("Set Reset Auth").click();
    });

    expect(screen.getByTestId("reset-auth").textContent).toBe("user@example.com");

    act(() => {
      screen.getByText("Clear Reset Auth").click();
    });

    expect(screen.getByTestId("reset-auth").textContent).toBe("none");
  });

  it("handles login action successfully and updates user state", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    const mockUser = {
      id: 2,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
    };

    const loginSpy = vi.spyOn(apiClient, "login").mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    });

    await act(async () => {
      screen.getByText("Login").click();
    });

    expect(loginSpy).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(screen.getByTestId("status").textContent).toBe("authenticated");
    expect(screen.getByTestId("user").textContent).toBe("Budi Santoso");
  });

  it("handles register action successfully", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    const mockUser = {
      id: 3,
      name: "New Citizen",
      email: "new@example.com",
      role: "citizen",
      status: "active",
    };

    const registerSpy = vi.spyOn(apiClient, "register").mockResolvedValue({
      user: mockUser,
      requires_verification: true,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    });

    await act(async () => {
      screen.getByText("Register").click();
    });

    expect(registerSpy).toHaveBeenCalled();
    expect(screen.getByTestId("status").textContent).toBe("authenticated");
    expect(screen.getByTestId("user").textContent).toBe("New Citizen");
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
