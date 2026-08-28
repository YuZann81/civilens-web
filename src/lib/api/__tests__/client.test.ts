import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiClient, checkApiHealth, getApiBaseUrl, getApiRootUrl, initCsrf } from "../client";
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

  it("initializes CSRF cookie against root sanctum route", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: {
        get: () => null,
      },
    });

    await initCsrf();
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/sanctum/csrf-cookie",
      expect.objectContaining({
        method: "GET",
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
