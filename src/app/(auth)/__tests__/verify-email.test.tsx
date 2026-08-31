import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VerifyEmailPage from "../verify-email/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as apiClient from "@/lib/api/client";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders verification prompt and resend button", () => {
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: null,
    });

    render(
      <AuthProvider>
        <VerifyEmailPage />
      </AuthProvider>
    );

    expect(screen.getByText("Verifikasi Identitas Warga")).toBeDefined();
    expect(screen.getByText("Email Anda")).toBeDefined();
    expect(screen.getByRole("button", { name: /saya sudah verifikasi/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /kirim ulang email verifikasi/i })).toBeDefined();
  });

  it("handles resend verification email with feedback", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: null,
    });

    const resendSpy = vi.spyOn(apiClient, "resendVerificationEmail").mockResolvedValue();

    render(
      <AuthProvider>
        <VerifyEmailPage />
      </AuthProvider>
    );

    const resendBtn = screen.getByRole("button", { name: /kirim ulang email verifikasi/i });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(resendSpy).toHaveBeenCalled();
      expect(screen.getByText(/tautan verifikasi baru telah dikirim/i)).toBeDefined();
    });
  });

  it("handles check status when still unverified", async () => {
    vi.spyOn(apiClient, "getAuthUser").mockResolvedValue({
      id: 1,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "citizen",
      status: "active",
      email_verified_at: null,
    });

    render(
      <AuthProvider>
        <VerifyEmailPage />
      </AuthProvider>
    );

    const checkBtn = screen.getByRole("button", { name: /saya sudah verifikasi/i });
    fireEvent.click(checkBtn);

    await waitFor(() => {
      expect(screen.getByText(/email belum terverifikasi/i)).toBeDefined();
    });
  });
});
