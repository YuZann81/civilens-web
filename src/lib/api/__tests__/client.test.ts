import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  apiClient,
  checkApiHealth,
  forgotPassword,
  getApiBaseUrl,
  getApiRootUrl,
  getAuthUser,
  getGoogleOAuthUrl,
  initCsrf,
  login,
  logout,
  register,
  resendVerificationEmail,
  resetPassword,
} from "../client";
import { ApiError } from "../types";

describe("API Client Foundation", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("resolves base URL with fallback", () => {
    const url = getApiBaseUrl();
    expect(url).toBeDefined();
    expect(url.length).toBeGreaterThan(0);
  });

  it("resolves API root URL correctly", () => {
    const rootUrl = getApiRootUrl();
    expect(rootUrl).toBe("http://localhost:8000");
  });

  it("resolves Google OAuth redirect URL correctly", () => {
    const oauthUrl = getGoogleOAuthUrl();
    expect(oauthUrl).toBe("http://localhost:8000/api/cv/v1/auth/google/redirect");
  });

  it("normalizes production base URL without cv/v1 prefix", () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = "https://api.razzan.site";

    expect(getApiBaseUrl()).toBe("https://api.razzan.site/cv/v1");
    expect(getGoogleOAuthUrl()).toBe("https://api.razzan.site/cv/v1/auth/google/redirect");
    expect(getApiRootUrl()).toBe("https://api.razzan.site");

    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  });

  it("preserves explicitly versioned production base URL", () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = "https://api.razzan.site/cv/v1";

    expect(getApiBaseUrl()).toBe("https://api.razzan.site/cv/v1");
    expect(getGoogleOAuthUrl()).toBe("https://api.razzan.site/cv/v1/auth/google/redirect");
    expect(getApiRootUrl()).toBe("https://api.razzan.site");

    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  });

  it("handles successful JSON response with credentials included", async () => {
    const mockData = { status: "ok" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (header: string) => (header === "content-type" ? "application/json" : null),
      },
      json: async () => mockData,
    });

    const response = await apiClient<{ status: string }>("/health");
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ status: "ok" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/health"),
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("initializes CSRF cookie against sanctum route", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: {
        get: () => null,
      },
    });

    await initCsrf();
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/cv/v1/sanctum/csrf-cookie",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      })
    );
  });

  it("executes login request and retrieves auth user", async () => {
    const mockUser = {
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => null },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ data: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ data: mockUser }),
      });

    const user = await login({ email: "budi@example.com", password: "password123" });
    expect(user).toEqual(mockUser);
  });

  it("executes register request", async () => {
    const mockUser = {
      id: 2,
      name: "Siti Rahma",
      email: "siti@example.com",
      role: "citizen",
      status: "active",
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => null },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: () => "application/json" },
        json: async () => ({
          data: { user: mockUser, requires_verification: true },
          message: "Account created.",
        }),
      });

    const result = await register({
      name: "Siti Rahma",
      email: "siti@example.com",
      password: "password123",
      password_confirmation: "password123",
    });

    expect(result.user).toEqual(mockUser);
    expect(result.requires_verification).toBe(true);
  });

  it("executes forgot password request", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => null },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ data: null, message: "Reset link sent." }),
      });

    await expect(forgotPassword("budi@example.com")).resolves.toBeUndefined();
  });

  it("executes resend verification email request", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => null },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ data: null, message: "Verification email resent." }),
      });

    await expect(resendVerificationEmail()).resolves.toBeUndefined();
  });

  it("executes reset password request", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => null },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ data: null, message: "Password reset successful." }),
      });

    await expect(
      resetPassword({
        token: "test-token-123",
        email: "user@example.com",
        password: "newPassword123",
        password_confirmation: "newPassword123",
      })
    ).resolves.toBeUndefined();
  });

  it("fetches authenticated user profile via getAuthUser", async () => {
    const mockUser = {
      id: 1,
      name: "Jane Citizen",
      email: "jane@example.com",
      role: "citizen",
      status: "active",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (header: string) => (header === "content-type" ? "application/json" : null),
      },
      json: async () => ({
        data: mockUser,
        message: "Authenticated user.",
      }),
    });

    const user = await getAuthUser();
    expect(user).toEqual(mockUser);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/cv/v1/auth/me",
      expect.objectContaining({
        credentials: "include",
      })
    );
  });

  it("executes logout request successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (header: string) => (header === "content-type" ? "application/json" : null),
      },
      json: async () => ({
        data: null,
        message: "Logged out successfully.",
      }),
    });

    await logout();
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/cv/v1/auth/logout",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });

  it("handles HTTP errors cleanly without exposing internals", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: {
        get: (header: string) => (header === "content-type" ? "application/json" : null),
      },
      json: async () => ({ message: "Not Found" }),
    });

    await expect(apiClient("/non-existent")).rejects.toThrowError(ApiError);
  });

  it("handles network failure and wraps in ApiError", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

    await expect(apiClient("/health")).rejects.toThrowError(ApiError);
  });

  it("calls checkApiHealth helper and returns data", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (header: string) => (header === "content-type" ? "application/json" : null),
      },
      json: async () => ({ status: "ok" }),
    });

    const result = await checkApiHealth();
    expect(result).toEqual({ status: "ok" });
  });
});
