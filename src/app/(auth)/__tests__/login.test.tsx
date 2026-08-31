import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../login/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders split panel layout with illustrations, form inputs, and Google auth button", () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    // Left Panel
    expect(screen.getByText("Laporkan & Pantau")).toBeDefined();
    expect(
      screen.getByText(/sampaikan isu warga, pantau progres/i)
    ).toBeDefined();

    // Right Panel
    expect(screen.getByText("Selamat datang,")).toBeDefined();
    expect(screen.getByLabelText("Alamat Email")).toBeDefined();
    expect(screen.getByLabelText("Kata Sandi")).toBeDefined();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeDefined();
    expect(screen.getByRole("link", { name: /masuk dengan google/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /daftar sekarang/i })).toBeDefined();
  });

  it("toggles password visibility when eye icon is clicked", () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText("Kata Sandi") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByRole("button", { name: /tampilkan sandi/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    const hideBtn = screen.getByRole("button", { name: /sembunyikan sandi/i });
    fireEvent.click(hideBtn);
    expect(passwordInput.type).toBe("password");
  });

  it("submits login credentials and handles invalid credentials error", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));
    vi.spyOn(apiClient, "login").mockRejectedValue(new ApiError(401, "Unauthenticated."));

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText("Alamat Email");
    const passwordInput = screen.getByLabelText("Kata Sandi");
    const submitBtn = screen.getByRole("button", { name: "Masuk" });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/alamat email atau kata sandi yang anda masukkan salah/i)
      ).toBeDefined();
    });
  });

  it("handles suspended account message on login", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockRejectedValue(new ApiError(401, "Unauthenticated."));
    vi.spyOn(apiClient, "login").mockResolvedValue({
      id: 99,
      name: "Suspended User",
      email: "suspended@example.com",
      role: "citizen",
      status: "suspended",
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText("Alamat Email");
    const passwordInput = screen.getByLabelText("Kata Sandi");
    const submitBtn = screen.getByRole("button", { name: "Masuk" });

    fireEvent.change(emailInput, { target: { value: "suspended@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/akun anda sedang ditangguhkan/i)).toBeDefined();
    });
  });
});
