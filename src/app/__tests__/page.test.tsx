import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "../page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

describe("HomePage", () => {
  it("renders brand heading, phase indicator, and auth actions", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    );

    expect(screen.getByText("CiviLens")).toBeDefined();
    expect(screen.getByText("Phase 0 Foundation")).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /making local environmental issues visible/i,
      })
    ).toBeDefined();

    await waitFor(() => {
      expect(screen.getAllByRole("link", { name: /continue with google/i })).toBeDefined();
    });
  });
});
