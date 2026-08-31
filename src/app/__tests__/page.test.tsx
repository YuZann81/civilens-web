import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HomePage from "../page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

describe("HomePage", () => {
  it("renders brand heading, phase indicator, and auth actions when unauthenticated", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    );

    expect(screen.getByText("CiviLens")).toBeDefined();
    expect(screen.getAllByText("Phase 0 Foundation").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /making local environmental issues visible/i,
      })
    ).toBeDefined();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Masuk" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Daftar" })).toBeDefined();
    });

    // Check hrefs
    expect(screen.getByRole("link", { name: "Masuk" }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("link", { name: "Daftar" }).getAttribute("href")).toBe("/register");
  });

  it("toggles mobile menu and displays mobile auth links", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Masuk" })).toBeDefined();
    });

    const toggleBtn = screen.getByRole("button", { name: /buka menu/i });
    fireEvent.click(toggleBtn);

    expect(screen.getAllByRole("link", { name: "Masuk" }).length).toBe(2);
    expect(screen.getAllByRole("link", { name: "Daftar" }).length).toBe(2);
  });

  it("renders user information and logout button when authenticated", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: "2026-08-30T00:00:00.000000Z",
    });

    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/masuk sebagai/i)).toBeDefined();
      expect(screen.getByText("Budi Santoso")).toBeDefined();
      expect(screen.getByRole("button", { name: "Keluar" })).toBeDefined();
    });

    // Should not show Masuk / Daftar in main nav
    expect(screen.queryByRole("link", { name: "Masuk" })).toBeNull();
  });
});
